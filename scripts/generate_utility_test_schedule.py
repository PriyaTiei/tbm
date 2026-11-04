#!/usr/bin/env python3
"""
Utility Maintenance Schedule Generator & Analyzer
==================================================
Simulates the day-by-day scheduling logic of the TBM app for Utility Cards
derived from 'FACILITY UTILITY DATA.xlsx'.

Target Server Reference: 10.82.126.73 (Live Server)

Usage:
  python scripts/generate_utility_test_schedule.py [options]

Options:
  --month=<1-12>      Display schedule for a specific month (e.g. --month=11)
  --date=<YYYY-MM-DD> Display full detailed card list for a specific date (e.g. --date=2026-11-08)
  --json              Export complete schedule to 'utility_schedule_2026.json'
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
DATA_FILE = os.path.join(SCRIPT_DIR, '..', 'backend', 'data', 'utility_checkitems.json')

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

def main():
    items = load_items()
    
    print("=" * 75)
    print("  TBM UTILITY CARDS - SCHEDULE & CALENDAR ANALYZER")
    print(f"  Source File      : {DATA_FILE}")
    print(f"  Live Server Ref  : http://10.82.126.73:5082")
    print(f"  Total DB Items   : {len(items)}")
    if TARGET_DATE:
        print(f"  Inspect Single Date: {TARGET_DATE}")
    elif TARGET_MONTH:
        print(f"  Inspect Month    : {TARGET_MONTH} / 2026")
    else:
        print("  Inspect Scope    : Full Year 2026")
    print("=" * 75)

    # 1. Single Date Detail Inspection
    if TARGET_DATE:
        parts = [int(p) for p in TARGET_DATE.split("-")]
        cur = datetime.date(parts[0], parts[1], parts[2])
        yr = cur.year
        mo = cur.month
        dt = cur.day
        dw = (cur.weekday() + 1) % 7
        wk = int(dt // 7.1) + 1
        day_name = cur.strftime("%A")

        p_items = [it for it in items if matches(it, yr, mo, dt, dw, wk, "P")]
        s_items = [it for it in items if matches(it, yr, mo, dt, dw, wk, "S")]
        tot = len(p_items) + len(s_items)

        print(f"\n📅 DATE: {TARGET_DATE} ({day_name})")
        print(f"   Parameters: Year(y)={yr}, Month(m)={mo}, Day(dt)={dt}, Week(w)={wk}, DayOfWeek(d)={dw}")
        print(f"   Total Cards: {tot} (Maintenance 'P': {len(p_items)}, Service 'S': {len(s_items)})\n")

        if p_items:
            print("🔹 MAINTENANCE CARDS (pS = 'P'):")
            for idx, it in enumerate(p_items, 1):
                print(f"   {idx:2d}. [{it.get('line')}] {it.get('processNo')} | {it.get('workDetail')} (Cycle: {it.get('cycle')})")

        if s_items:
            print("\n🔸 SERVICE CARDS (pS = 'S'):")
            for idx, it in enumerate(s_items, 1):
                print(f"   {idx:2d}. [{it.get('line')}] {it.get('processNo')} | {it.get('workDetail')} (Cycle: {it.get('cycle')})")

        if tot == 0:
            print("   ℹ️ No cards scheduled for this date.")
        print("=" * 75)
        return

    # 2. Year Simulation
    start = datetime.date(2026, 1, 1)
    end = datetime.date(2026, 12, 31)
    cur = start

    dates_info = []

    while cur <= end:
        if TARGET_MONTH and cur.month != int(TARGET_MONTH):
            cur += datetime.timedelta(days=1)
            continue

        yr = cur.year
        mo = cur.month
        dt = cur.day
        dw = (cur.weekday() + 1) % 7
        wk = int(dt // 7.1) + 1
        
        matching_items = [it for it in items if matches(it, yr, mo, dt, dw, wk)]
        if matching_items:
            p_count = sum(1 for it in matching_items if it.get('pS') == 'P')
            s_count = sum(1 for it in matching_items if it.get('pS') == 'S')
            plants = Counter(it.get('line') for it in matching_items)
            dates_info.append({
                'date': cur.isoformat(),
                'day_name': cur.strftime('%a'),
                'd': dw,
                'w': wk,
                'm': mo,
                'y': yr,
                'dt': dt,
                'total': len(matching_items),
                'p_count': p_count,
                's_count': s_count,
                'plants': dict(plants),
                'items': [{'line': it.get('line'), 'processNo': it.get('processNo'), 'workDetail': it.get('workDetail'), 'cycle': it.get('cycle'), 'pS': it.get('pS')} for it in matching_items]
            })
        cur += datetime.timedelta(days=1)

    print(f"\nTotal Active Maintenance Dates: {len(dates_info)}")

    by_month = defaultdict(list)
    for d in dates_info:
        by_month[d['m']].append(d)

    for m in sorted(by_month.keys()):
        month_name = datetime.date(2026, m, 1).strftime('%B')
        print(f"\n=== {month_name} 2026 ({len(by_month[m])} active dates) ===")
        for d in by_month[m]:
            plant_summary = ', '.join([f'{k}: {v}' for k, v in d['plants'].items()])
            print(f"  {d['date']} ({d['day_name']}) | Total: {d['total']:2d} [P: {d['p_count']:2d}, S: {d['s_count']:2d}] | Plants: {plant_summary}")

    if EXPORT_JSON:
        out_path = os.path.abspath("utility_schedule_2026.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(dates_info, f, indent=2, ensure_ascii=False)
        print(f"\n[INFO] Exported {len(dates_info)} dates to: {out_path}")

    print("\n" + "=" * 75)

if __name__ == '__main__':
    main()
