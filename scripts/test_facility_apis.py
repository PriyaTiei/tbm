#!/usr/bin/env python3
"""
Automated API Test Suite for Facility Cards (Live Server: 10.82.126.73)
======================================================================
Tests backend APIs (/head/headCheckList and /head/headMachineList) against
the ground-truth schedule parsed from 'backend/data/facility_checkitems.json'.

Facility Ports:
  Backend  : 5091 (DB: facilityAutoMaint)
  Frontend : 3003

Usage:
  python3 scripts/test_facility_apis.py [options]

Options:
  --host=<ip>         Server IP or hostname (default: 10.82.126.73)
  --port=<port>       Backend port (default: 5091)
  --month=<1-12>      Test only dates in this month (e.g. --month=11)
  --date=<YYYY-MM-DD> Test a single specific date (e.g. --date=2026-11-15)
  --sample            Test 10 representative benchmark dates across the year
  --dry-run           Run offline validation without connecting to server
  --output=<file>     Output JSON report file (default: facility_test_report.json)
"""

import sys
import json
import os
import datetime
import urllib.request
import urllib.parse
from collections import defaultdict

# UTF-8 stdout protection for Windows / Linux console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "..", "backend", "data", "facility_checkitems.json")

args = sys.argv[1:]
def get_arg(name, default=None):
    for a in args:
        if a.startswith(f"--{name}="):
            return a.split("=")[1]
    return default

HOST = get_arg("host", "10.82.126.73")
EXPLICIT_PORT = get_arg("port")
PORT = EXPLICIT_PORT if EXPLICIT_PORT else "5091"
TARGET_MONTH = get_arg("month")
TARGET_DATE = get_arg("date")
REPORT_FILE = get_arg("output", "facility_test_report.json")
IS_SAMPLE = "--sample" in args or "-s" in args
IS_DRY_RUN = "--dry-run" in args

BASE_URL = f"http://{HOST}:{PORT}"

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

def build_ground_truth_schedule(items, target_month=None, target_date=None, sample_only=False):
    schedule = {}
    day_abbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    if target_date:
        parts = [int(p) for p in target_date.split("-")]
        dates_to_test = [datetime.date(parts[0], parts[1], parts[2])]
    else:
        start_date = datetime.date(2026, 1, 1)
        end_date = datetime.date(2026, 12, 31)
        dates_to_test = []
        cur = start_date
        while cur <= end_date:
            if target_month is None or cur.month == int(target_month):
                dates_to_test.append(cur)
            cur += datetime.timedelta(days=1)

    for cur in dates_to_test:
        yr, mo, dt = cur.year, cur.month, cur.day
        dw = (cur.weekday() + 1) % 7
        wk = int(dt // 7.1) + 1
        d_str = cur.strftime("%Y-%m-%d")

        p_items = [it for it in items if matches(it, yr, mo, dt, dw, wk, "P")]
        s_items = [it for it in items if matches(it, yr, mo, dt, dw, wk, "S")]

        if p_items or s_items:
            schedule[d_str] = {
                "date": d_str,
                "day_name": day_abbr[dw],
                "y": yr, "m": mo, "dt": dt, "w": wk, "d": dw,
                "expected_P": len(p_items),
                "expected_S": len(s_items),
                "p_items": [{"line": i.get("line"), "proc": i.get("processNo"), "work": i.get("workDetail")} for i in p_items],
                "s_items": [{"line": i.get("line"), "proc": i.get("processNo"), "work": i.get("workDetail")} for i in s_items]
            }

    if sample_only and len(schedule) > 10:
        keys = sorted(schedule.keys())
        step = max(1, len(keys) // 10)
        sampled_keys = [keys[i] for i in range(0, len(keys), step)][:10]
        schedule = {k: schedule[k] for k in sampled_keys}

    return schedule

def test_api_date(entry, base_url):
    results = {}
    for ps in ["P", "S"]:
        expected_count = entry[f"expected_{ps}"]
        url = f"{base_url}/head/headCheckList?d={entry['d']}&w={entry['w']}&m={entry['m']}&y={entry['y']}&pS={ps}"
        
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                status_code = response.getcode()
                raw_data = response.read().decode("utf-8")
                data = json.loads(raw_data)
                cards = data.get("headCheckList", [])
                actual_count = len(cards)
                error_note = None
        except urllib.error.HTTPError as e:
            status_code = e.code
            if status_code == 404 and expected_count == 0:
                actual_count = 0
                error_note = None
            else:
                actual_count = 0
                error_note = f"HTTP {e.code} - {e.reason}"
        except Exception as e:
            status_code = 0
            actual_count = 0
            error_note = f"Connection Failed: {e}"

        results[ps] = {
            "expected": expected_count,
            "actual": actual_count,
            "match": actual_count == expected_count,
            "status": status_code,
            "error": error_note
        }
    return results

def test_server_connection(base_url):
    print(f"[*] Testing connection to Live Facility Server at {base_url}...")
    test_urls = [
        f"{base_url}/head/allHeadCheckList",
        f"{base_url}/head/headCheckList?pS=P",
    ]
    for url in test_urls:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=4) as response:
                raw_data = response.read().decode("utf-8")
                data = json.loads(raw_data)
                cards = data.get("headCheckList", [])
                total = len(cards)
                sample_lines = set(c.get("line") for c in cards[:5] if c.get("line"))
                print(f"[+] Connected to {base_url} — Found {total} total cards in database.")
                if sample_lines:
                    print(f"    Sample lines in DB: {sample_lines}")
                return True, total
        except Exception:
            continue
    return False, 0

def run_tests():
    items = load_ground_truth()

    mode_label = "Full Year 2026"
    if TARGET_DATE:
        mode_label = f"Single Date ({TARGET_DATE})"
    elif TARGET_MONTH:
        mode_label = f"Month {TARGET_MONTH} / 2026"
    elif IS_SAMPLE:
        mode_label = "10 Benchmark Sample Dates"

    print("=" * 75)
    print("  TBM FACILITY CARDS - LIVE SERVER VERIFICATION TEST SUITE")
    print(f"  Live Server Host : {HOST}")
    print(f"  Backend Port     : {PORT}")
    print(f"  Target URL       : {BASE_URL}")
    print(f"  Ground-Truth Cards: {len(items)}")
    print(f"  Filter Mode      : {mode_label}")
    print("=" * 75)
    print()

    active_schedule = build_ground_truth_schedule(
        items,
        target_month=TARGET_MONTH,
        target_date=TARGET_DATE,
        sample_only=IS_SAMPLE
    )

    if not IS_DRY_RUN:
        connected, card_count = test_server_connection(BASE_URL)
        if not connected:
            print(f"[!] Warning: Unable to connect to {BASE_URL}")
            print("    Make sure the Facility backend is running on port 5091:")
            print("    Run on Ubuntu server:  cd ~/Yousuf/facilityAutoMaint_v2 && npm run facility-backend")
            print("    Proceeding with tests...")
            print()
    else:
        print("[*] Dry-run mode enabled: Skipping network calls.")
        print()

    passed_count = 0
    failed_count = 0
    report_data = []

    for d_str, meta in sorted(active_schedule.items()):
        day_name = meta["day_name"]
        exp_p = meta["expected_P"]
        exp_s = meta["expected_S"]

        if IS_DRY_RUN:
            print(f"[VALID] {d_str} ({day_name}): Expected P={exp_p:2d}, S={exp_s:2d}")
            passed_count += 1
            report_data.append({"date": d_str, "status": "DRY_RUN", "meta": meta})
            continue

        res = test_api_date(meta, BASE_URL)
        p_res = res["P"]
        s_res = res["S"]
        both_match = p_res["match"] and s_res["match"]

        if both_match:
            passed_count += 1
            print(f"[PASS] {d_str} ({day_name}): Expected P={exp_p:2d}, S={exp_s:2d} -> API P={p_res['actual']:2d}, S={s_res['actual']:2d}")
        else:
            failed_count += 1
            print(f"[FAIL] {d_str} ({day_name}): Expected P={exp_p:2d}, S={exp_s:2d} -> API P={p_res['actual']:2d}, S={s_res['actual']:2d}")
            if not p_res["match"] and p_res["error"]:
                print(f"       Note (P): {p_res['error']}")
            if not s_res["match"] and s_res["error"]:
                print(f"       Note (S): {s_res['error']}")

        report_data.append({
            "date": d_str,
            "day": day_name,
            "status": "PASS" if both_match else "FAIL",
            "P": p_res,
            "S": s_res,
            "meta": meta
        })

    out_path = os.path.abspath(REPORT_FILE)
    try:
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)
        print()
        print(f"[INFO] Complete test report saved to: {out_path}")
    except Exception as e:
        print(f"[!] Could not save report file: {e}")

    print("=" * 75)
    total_tested = passed_count + failed_count
    print(f"TEST SUMMARY: {passed_count} PASSED, {failed_count} FAILED (Total Dates Tested: {total_tested})")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
