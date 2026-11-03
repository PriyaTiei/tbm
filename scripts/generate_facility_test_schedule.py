#!/usr/bin/env python3
"""
Facility Maintenance Schedule Generator & Analyzer
===================================================
Simulates the day-by-day scheduling logic of the TBM app for Facility Cards
derived from 'backend/data/facility_checkitems.json'.

Target Server Reference: 10.82.126.73 (Live Server)
Target Backend Port:     5083 (facilityAutoMaint DB)
Target Frontend Port:    3003

Usage:
  python scripts/generate_facility_test_schedule.py [options]

Options:
  --month=<1-12>      Display schedule for a specific month (e.g. --month=11)
  --date=<YYYY-MM-DD> Display full detailed card list for a specific date (e.g. --date=2026-11-15)
  --json              Export complete schedule to 'facility_schedule_2026.json'
"""

import sys
import json
import os
import datetime
from collections import defaultdict, Counter

# UTF-8 stdout protection for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, '..', 'backend', 'data', 'facility_checkitems.json')

args = sys.argv[1:]
def get_arg(name, default=None):
    for a in args:
        if a.startswith(f"--{name}="):
            return a.split("=")[1]
    return default

TARGET_MONTH = get_arg("month")
TARGET_DATE = get_arg("date")
EXPORT_JSON = "--json" in args

def load_items():
    if not os.path.exists(DATA_FILE):
        print(f"[ERROR] Data file not found: {DATA_FILE}")
        sys.exit(1)
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def matches(it, yr, mo, dt, dw, wk, ps=None):
    if ps is not None and it.get('pS') != ps:
        return False
    y_list = it.get('y', [9999])
    if 9999 not in y_list and yr not in y_list:
        return False
    m_list = it.get('m', [9999])
    if 9999 not in m_list and mo not in m_list:
        return False
    w_list = it.get('w', [9999])
    if 9999 not in w_list and wk not in w_list:
        return False
    d_list = it.get('d', [9999])
    d_targets = {dw}
    if dw == 0 or dw == 7:
        d_targets.add(0)
        d_targets.add(7)
    if 9999 not in d_list and not (set(d_list) & d_targets):
        return False
    return True

def analyze():
    items = load_items()
    total_db = len(items)

    print("=" * 75)
    print("  TBM FACILITY CARDS - SCHEDULE & CALENDAR ANALYZER")
    print(f"  Source File      : {DATA_FILE}")
    print(f"  Live Server Ref  : http://10.82.126.73:5083 (DB: facilityAutoMaint)")
    print(f"  Frontend Ref     : http://10.82.126.73:3003")
    print(f"  Total DB Items   : {total_db}")
    if TARGET_DATE:
        print(f"  Inspect Single Date: {TARGET_DATE}")
    elif TARGET_MONTH:
        print(f"  Inspect Month    : {TARGET_MONTH} / 2026")
    else:
        print("  Inspect Scope    : Full Year 2026")
    print("=" * 75)
    print()

    # If single date requested
    if TARGET_DATE:
        try:
            parts = [int(p) for p in TARGET_DATE.split('-')]
            cur_date = datetime.date(parts[0], parts[1], parts[2])
        except Exception as e:
            print(f"[ERROR] Invalid date format. Use YYYY-MM-DD. Error: {e}")
            return

        yr, mo, dt = cur_date.year, cur_date.month, cur_date.day
        dw = (cur_date.weekday() + 1) % 7 # Sunday is 0
        wk = int(dt // 7.1) + 1
        day_names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        maint_cards = [it for it in items if matches(it, yr, mo, dt, dw, wk, 'P')]
        serv_cards  = [it for it in items if matches(it, yr, mo, dt, dw, wk, 'S')]
        total_cards = len(maint_cards) + len(serv_cards)

        print(f"📅 DATE: {TARGET_DATE} ({day_names[dw]})")
        print(f"   Parameters: Year(y)={yr}, Month(m)={mo}, Day(dt)={dt}, Week(w)={wk}, DayOfWeek(d)={dw}")
        print(f"   Total Cards: {total_cards} (Maintenance 'P': {len(maint_cards)}, Service 'S': {len(serv_cards)})")
        print()

        if maint_cards:
            print(f"🔹 MAINTENANCE CARDS (pS = 'P'):")
            for idx, c in enumerate(maint_cards, 1):
                line = c.get('line', 'N/A')
                proc = c.get('processNo', 'N/A')
                wdet = c.get('workDetail', 'N/A')
                cyc  = c.get('cycle', 'N/A')
                print(f"  {idx:2d}. [{line}] {proc} | {wdet} (Cycle: {cyc})")
            print()
        else:
            print("🔹 MAINTENANCE CARDS (pS = 'P'): None")
            print()

        if serv_cards:
            print(f"🔸 SERVICE CARDS (pS = 'S'):")
            for idx, c in enumerate(serv_cards, 1):
                line = c.get('line', 'N/A')
                proc = c.get('processNo', 'N/A')
                wdet = c.get('workDetail', 'N/A')
                cyc  = c.get('cycle', 'N/A')
                print(f"  {idx:2d}. [{line}] {proc} | {wdet} (Cycle: {cyc})")
            print()
        else:
            print("🔸 SERVICE CARDS (pS = 'S'): None")
            print()

        print("=" * 75)
        return

    # Multi-date / month summary
    start_date = datetime.date(2026, 1, 1)
    end_date = datetime.date(2026, 12, 31)
    cur = start_date

    calendar_schedule = defaultdict(lambda: {"P": 0, "S": 0, "plants": Counter(), "items": []})
    day_abbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    while cur <= end_date:
        yr, mo, dt = cur.year, cur.month, cur.day
        dw = (cur.weekday() + 1) % 7
        wk = int(dt // 7.1) + 1
        d_str = cur.strftime("%Y-%m-%d")

        for it in items:
            if matches(it, yr, mo, dt, dw, wk):
                ps = it.get('pS', 'P')
                calendar_schedule[d_str][ps] += 1
                calendar_schedule[d_str]["plants"][it.get("line", "Unknown")] += 1
                calendar_schedule[d_str]["items"].append({
                    "line": it.get("line"),
                    "processNo": it.get("processNo"),
                    "workDetail": it.get("workDetail"),
                    "pS": ps,
                    "cycle": it.get("cycle")
                })
        cur += datetime.timedelta(days=1)

    active_dates = {k: v for k, v in calendar_schedule.items() if v["P"] > 0 or v["S"] > 0}
    print(f"Total Active Maintenance Dates in 2026: {len(active_dates)}")
    print()

    months_to_print = [int(TARGET_MONTH)] if TARGET_MONTH else range(1, 13)

    for m in months_to_print:
        m_name = datetime.date(2026, m, 1).strftime("%B")
        m_dates = [d for d in active_dates.keys() if int(d.split("-")[1]) == m]
        print(f"=== {m_name} 2026 ({len(m_dates)} active dates) ===")
        if not m_dates:
            print("  (No maintenance scheduled for this month)")
        for d in sorted(m_dates):
            data = active_dates[d]
            total = data["P"] + data["S"]
            d_obj = datetime.datetime.strptime(d, "%Y-%m-%d").date()
            dw_str = day_abbr[(d_obj.weekday() + 1) % 7]
            plants_str = ", ".join([f"{k}: {v}" for k, v in data["plants"].items()])
            print(f"  {d} ({dw_str}) | Total: {total:2d} [P: {data['P']:2d}, S: {data['S']:2d}] | Lines: {plants_str}")
        print()

    if EXPORT_JSON:
        out_file = "facility_schedule_2026.json"
        serializable = {}
        for d, v in active_dates.items():
            serializable[d] = {
                "P": v["P"],
                "S": v["S"],
                "plants": dict(v["plants"]),
                "items": v["items"]
            }
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(serializable, f, indent=2)
        print(f"[SUCCESS] Exported 2026 facility schedule to: {out_file}")

    print("=" * 75)

if __name__ == '__main__':
    analyze()
