#!/usr/bin/env python3
"""
Automated API Test Suite for Utility Cards
==========================================
Tests backend APIs (/head/headCheckList and /head/headMachineList) against
the ground-truth schedule parsed from 'FACILITY UTILITY DATA.xlsx'.

Outputs a detailed test summary to console and saves full results to
'utility_test_report.json' so results can be reviewed and shared.

Usage:
  python scripts/test_utility_apis.py [options]

Options:
  --host=<ip>       Server IP or hostname (default: 10.82.126.73)
  --port=<port>     Backend port (default: 5073)
  --month=<1-12>    Test only dates in this month (e.g. --month=11)
  --date=<YYYY-MM-DD> Test a single specific date (e.g. --date=2026-11-08)
  --sample          Test only 10 representative benchmark dates
  --dry-run         Run offline validation without connecting to server
  --output=<file>   Output JSON report file (default: utility_test_report.json)
"""

import sys
import json
import os
import datetime
import urllib.request
import urllib.parse
from collections import defaultdict

# UTF-8 stdout protection for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Parse command line flags
args = sys.argv[1:]
def get_arg(name, default):
    for a in args:
        if a.startswith(f"--{name}="):
            return a.split("=")[1]
    return default

HOST = get_arg("host", os.environ.get("REACT_APP_HOST", "10.82.126.73"))
PORT = get_arg("port", os.environ.get("PORT", "5073"))
TARGET_MONTH = get_arg("month", None)
TARGET_DATE = get_arg("date", None)
REPORT_FILE = get_arg("output", "utility_test_report.json")
IS_SAMPLE = "--sample" in args or "-s" in args
IS_DRY_RUN = "--dry-run" in args

BASE_URL = f"http://{HOST}:{PORT}"

# Locate ground-truth json
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "..", "backend", "data", "utility_checkitems.json")

def load_ground_truth():
    if not os.path.exists(DATA_FILE):
        print(f"[ERROR] Ground truth file not found: {DATA_FILE}")
        sys.exit(1)
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def matches(it, yr, mo, dt, dw, wk, ps=None):
    if ps is not None and it.get("pS") != ps:
        return False
    y_list = it.get("y", [9999])
    if 9999 not in y_list and yr not in y_list:
        return False
    m_list = it.get("m", [9999])
    if 9999 not in m_list and mo not in m_list:
        return False
    w_list = it.get("w", [9999])
    if 9999 not in w_list and wk not in w_list:
        return False
    d_list = it.get("d", [9999])
    d_targets = {dw}
    if dw == 0 or dw == 7:
        d_targets.add(0)
        d_targets.add(7)
    if 9999 not in d_list and not (set(d_list) & d_targets):
        return False
    return True

def query_api(endpoint, params):
    qs = urllib.parse.urlencode(params)
    url = f"{BASE_URL}{endpoint}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": "TBM-Tester/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return True, data, resp.status
    except urllib.error.HTTPError as e:
        try:
            err_data = json.loads(e.read().decode("utf-8"))
            return False, err_data, e.code
        except Exception:
            return False, str(e), e.code
    except Exception as e:
        return False, str(e), 0

def run_tests():
    items = load_ground_truth()
    print("=" * 75)
    print("  TBM UTILITY CARDS - AUTOMATED API VERIFICATION TEST SUITE")
    print(f"  Target Server: {BASE_URL}")
    print(f"  Total Utility Ground-Truth Items: {len(items)}")
    if TARGET_DATE:
        print(f"  Filter: Single Date ({TARGET_DATE})")
    elif TARGET_MONTH:
        print(f"  Filter: Month {TARGET_MONTH} / 2026")
    elif IS_SAMPLE:
        print("  Filter: 10 Representative Benchmark Dates")
    else:
        print("  Filter: Full Year 2026 (All 125 Active Maintenance Dates)")
    if IS_DRY_RUN:
        print("  Mode: [DRY-RUN / OFFLINE] - Validating schedule data locally")
    print("=" * 75 + "\n")

    # Generate dates to test in 2026
    start_date = datetime.date(2026, 1, 1)
    end_date = datetime.date(2026, 12, 31)

    if TARGET_DATE:
        parts = [int(p) for p in TARGET_DATE.split("-")]
        start_date = datetime.date(parts[0], parts[1], parts[2])
        end_date = start_date

    test_dates = []
    cur = start_date
    while cur <= end_date:
        if TARGET_MONTH and cur.month != int(TARGET_MONTH):
            cur += datetime.timedelta(days=1)
            continue
        
        yr = cur.year
        mo = cur.month
        dt = cur.day
        dw = (cur.weekday() + 1) % 7 # 0=Sun, 1=Mon, ..., 6=Sat
        wk = int(dt // 7.1) + 1

        exp_p_items = [it for it in items if matches(it, yr, mo, dt, dw, wk, "P")]
        exp_s_items = [it for it in items if matches(it, yr, mo, dt, dw, wk, "S")]
        exp_tot = len(exp_p_items) + len(exp_s_items)

        if exp_tot > 0 or TARGET_DATE:
            test_dates.append({
                "date": cur.isoformat(),
                "day_name": cur.strftime("%a"),
                "yr": yr, "mo": mo, "dt": dt, "dw": dw, "wk": wk,
                "exp_p": len(exp_p_items),
                "exp_s": len(exp_s_items),
                "exp_tot": exp_tot,
                "exp_p_items": [{"line": it.get("line"), "processNo": it.get("processNo"), "workDetail": it.get("workDetail")} for it in exp_p_items],
                "exp_s_items": [{"line": it.get("line"), "processNo": it.get("processNo"), "workDetail": it.get("workDetail")} for it in exp_s_items],
            })
        cur += datetime.timedelta(days=1)

    if IS_SAMPLE and not TARGET_DATE:
        test_dates.sort(key=lambda x: x["exp_tot"], reverse=True)
        test_dates = test_dates[:10]
        test_dates.sort(key=lambda x: x["date"])

    passed = 0
    failed = 0
    results_report = []

    for t in test_dates:
        d_str = t["date"]
        
        if IS_DRY_RUN:
            # Offline test mode
            passed += 1
            print(f"[OFFLINE PASS] {d_str} ({t['day_name']}): Expected Cards = {t['exp_tot']} (P: {t['exp_p']}, S: {t['exp_s']}) | w={t['wk']}, d={t['dw']}")
            results_report.append({
                "date": d_str,
                "day": t["day_name"],
                "status": "OFFLINE_VALIDATED",
                "expected": {"total": t["exp_tot"], "p": t["exp_p"], "s": t["exp_s"]},
                "actual": {"total": t["exp_tot"], "p": t["exp_p"], "s": t["exp_s"]},
                "p_items": t["exp_p_items"],
                "s_items": t["exp_s_items"]
            })
            continue

        # 1. Test Maintenance Dept (pS = P)
        p_params = {"d": t["dw"], "w": t["wk"], "m": t["mo"], "y": t["yr"], "pS": "P", "page": 1}
        ok_p, res_p, code_p = query_api("/head/headCheckList", p_params)
        act_p = res_p.get("totalCount", 0) if ok_p and isinstance(res_p, dict) else 0
        returned_p_cards = res_p.get("headCheckList", []) if ok_p and isinstance(res_p, dict) else []

        # 2. Test Service Dept (pS = S) if expected > 0
        act_s = 0
        returned_s_cards = []
        code_s = 200
        ok_s = True
        if t["exp_s"] > 0:
            s_params = {"d": t["dw"], "w": t["wk"], "m": t["mo"], "y": t["yr"], "pS": "S", "page": 1}
            ok_s, res_s, code_s = query_api("/head/headCheckList", s_params)
            act_s = res_s.get("totalCount", 0) if ok_s and isinstance(res_s, dict) else 0
            returned_s_cards = res_s.get("headCheckList", []) if ok_s and isinstance(res_s, dict) else []

        p_match = (act_p == t["exp_p"])
        s_match = (act_s == t["exp_s"]) if t["exp_s"] > 0 else True
        is_pass = p_match and s_match

        report_entry = {
            "date": d_str,
            "day": t["day_name"],
            "status": "PASS" if is_pass else "FAIL",
            "expected": {"total": t["exp_tot"], "p": t["exp_p"], "s": t["exp_s"]},
            "actual": {"total": act_p + act_s, "p": act_p, "s": act_s},
            "http_codes": {"p": code_p, "s": code_s},
            "expected_p_items": t["exp_p_items"],
            "expected_s_items": t["exp_s_items"]
        }

        if is_pass:
            passed += 1
            print(f"[PASS] {d_str} ({t['day_name']}): Expected P={t['exp_p']}, S={t['exp_s']} -> API P={act_p}, S={act_s}")
        else:
            failed += 1
            print(f"[FAIL] {d_str} ({t['day_name']}): Expected P={t['exp_p']}, S={t['exp_s']} -> API P={act_p}, S={act_s}")
            if not ok_p:
                print(f"       API Error (P): HTTP {code_p} - {res_p}")
            if t["exp_s"] > 0 and not ok_s:
                print(f"       API Error (S): HTTP {code_s} - {res_s}")

        results_report.append(report_entry)

    # Save results to output file
    try:
        report_path = os.path.abspath(REPORT_FILE)
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump({
                "runAt": datetime.datetime.now().isoformat(),
                "server": BASE_URL,
                "summary": {"totalDates": len(test_dates), "passed": passed, "failed": failed},
                "dates": results_report
            }, f, indent=2, ensure_ascii=False)
        print(f"\n[INFO] Complete test report saved to: {report_path}")
    except Exception as e:
        print(f"[WARN] Could not write report file: {e}")

    print("=" * 75)
    print(f"TEST SUMMARY: {passed} PASSED, {failed} FAILED (Total Dates Tested: {len(test_dates)})")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
