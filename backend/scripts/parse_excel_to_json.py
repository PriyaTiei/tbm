#!/usr/bin/env python3
"""
Excel Ingestion Parser for Utility & Facility Data
Parses 'FACILITY UTILITY DATA.xlsx' into clean, schema-compliant JSON files:
- backend/data/utility_checkitems.json (for utilityAutoMaint database)
- backend/data/facility_checkitems.json (for facilityAutoMaint database)
"""

import os
import re
import json
import openpyxl

EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'FACILITY UTILITY DATA.xlsx')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def parse_ints(val):
    if val is None:
        return []
    s = str(val).strip()
    if not s or s in ('-', 'NA', 'N/A'):
        return []
    parts = re.split(r'[&,/\s]+', s)
    res = []
    for p in parts:
        if p.isdigit():
            res.append(int(p))
    return res

def parse_utility_sheet(wb):
    sheet = wb['UTILITY DEPT']
    rows = list(sheet.iter_rows(values_only=True))
    items = []

    for r in rows[1:205]:
        if not (r[0] or r[2]):
            continue

        plant = str(r[1]).strip() if r[1] is not None and str(r[1]).strip() not in ('', '-') else 'Common'
        equipment = str(r[2]).strip() if r[2] is not None and str(r[2]).strip() not in ('', '-') else 'General'
        make = str(r[3]).strip() if r[3] is not None and str(r[3]).strip() not in ('', '-', 'NA', 'N/A') else '-'
        activity = str(r[4]).strip() if r[4] is not None and str(r[4]).strip() not in ('', '-') else equipment

        y = []
        for c in [13, 14, 15, 16]:
            y.extend(parse_ints(r[c]))
        y = sorted(list(set(y))) if y else [9999]

        m = []
        for c in [17, 18, 19, 20, 21, 22]:
            m.extend(parse_ints(r[c]))
        m = sorted(list(set(m))) if m else [9999]

        w = parse_ints(r[23])
        w = sorted(list(set(w))) if w else [9999]

        d = parse_ints(r[24])
        d = sorted(list(set(d))) if d else [9999]

        cycle = str(r[5]).strip() if r[5] is not None else '1/1Y'
        pS = str(r[9]).strip() if r[9] is not None else 'P'
        rS = str(r[10]).strip() if r[10] is not None else 'S'

        doc = {
            'line': plant,
            'processNo': equipment,
            'model': make,
            'workDetail': activity,
            'cycle': cycle,
            'pS': pS,
            'rS': rS,
            'y': y,
            'm': m,
            'w': w,
            'd': d,
            'area': str(r[0]).strip() if r[0] is not None else plant,
            'tool': str(r[6]).strip() if r[6] is not None and str(r[6]).strip() not in ('', '-') else '-',
            'workManpower': str(r[7]).strip() if r[7] is not None and str(r[7]).strip() not in ('', '-') else '1',
            'workTime': str(r[8]).strip() if r[8] is not None and str(r[8]).strip() not in ('', '-') else '30',
            'criterion': str(r[36]).strip() if r[36] is not None and str(r[36]).strip() not in ('', '-') else 'Normal working condition',
            'action': str(r[33]).strip() if r[33] is not None and str(r[33]).strip() not in ('', '-') else 'Inspect / Clean / Service'
        }
        items.append(doc)

    return items

def parse_facility_sheet(wb):
    sheet = wb['FACILITY']

    # Unmerge merged ranges in openpyxl
    merged_vals = {}
    for m_range in sheet.merged_cells.ranges:
        top_left = sheet.cell(m_range.min_row, m_range.min_col).value
        for row_i in range(m_range.min_row, m_range.max_row + 1):
            for col_i in range(m_range.min_col, m_range.max_col + 1):
                merged_vals[(row_i, col_i)] = top_left

    def get_c(r_idx, col_idx):
        if (r_idx, col_idx) in merged_vals:
            return merged_vals[(r_idx, col_idx)]
        return sheet.cell(r_idx, col_idx).value

    items = []
    for r_idx in range(2, 48):
        area = get_c(r_idx, 1)
        sub_area = get_c(r_idx, 2)
        equip = get_c(r_idx, 3)
        make = get_c(r_idx, 4)
        activity = get_c(r_idx, 5)

        area_str = str(area).strip() if area is not None and str(area).strip() not in ('', '-') else 'General Facility'
        sub_area_str = str(sub_area).strip() if sub_area is not None and str(sub_area).strip() not in ('', '-') else 'All Area'
        equip_str = str(equip).strip() if equip is not None and str(equip).strip() not in ('', '-') else sub_area_str
        make_str = str(make).strip() if make is not None and str(make).strip() not in ('', '-', 'NA', 'N/A') else '-'
        activity_str = str(activity).strip() if activity is not None and str(activity).strip() not in ('', '-') else equip_str

        y = []
        for c in [14, 15, 16, 17]:
            y.extend(parse_ints(get_c(r_idx, c)))
        y = sorted(list(set(y))) if y else [9999]

        m = []
        for c in [18, 19, 20, 21, 22, 23]:
            m.extend(parse_ints(get_c(r_idx, c)))
        m = sorted(list(set(m))) if m else [9999]

        w = parse_ints(get_c(r_idx, 24))
        w = sorted(list(set(w))) if w else [9999]

        d = parse_ints(get_c(r_idx, 25))
        d = sorted(list(set(d))) if d else [9999]

        cycle = str(get_c(r_idx, 6)).strip() if get_c(r_idx, 6) is not None else '1/1M'
        pS = str(get_c(r_idx, 10)).strip() if get_c(r_idx, 10) is not None else 'P'
        rS = str(get_c(r_idx, 11)).strip() if get_c(r_idx, 11) is not None else 'S'

        doc = {
            'line': area_str,
            'processNo': sub_area_str,
            'model': equip_str,
            'workDetail': activity_str,
            'cycle': cycle,
            'pS': pS,
            'rS': rS,
            'y': y,
            'm': m,
            'w': w,
            'd': d,
            'area': area_str,
            'subArea': sub_area_str,
            'tool': str(get_c(r_idx, 7)).strip() if get_c(r_idx, 7) is not None and str(get_c(r_idx, 7)).strip() not in ('', '-') else '-',
            'workManpower': str(get_c(r_idx, 8)).strip() if get_c(r_idx, 8) is not None and str(get_c(r_idx, 8)).strip() not in ('', '-') else '1',
            'workTime': str(get_c(r_idx, 9)).strip() if get_c(r_idx, 9) is not None and str(get_c(r_idx, 9)).strip() not in ('', '-') else '30',
            'criterion': str(get_c(r_idx, 37)).strip() if get_c(r_idx, 37) is not None and str(get_c(r_idx, 37)).strip() not in ('', '-') else 'Area clean and functional',
            'action': str(get_c(r_idx, 34)).strip() if get_c(r_idx, 34) is not None and str(get_c(r_idx, 34)).strip() not in ('', '-') else 'Inspect / Clean / Service'
        }
        items.append(doc)

    return items

def main():
    print(f'Loading Excel: {EXCEL_PATH}...')
    wb = openpyxl.load_workbook(EXCEL_PATH)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print('Parsing UTILITY DEPT sheet...')
    util_items = parse_utility_sheet(wb)
    util_out = os.path.join(OUTPUT_DIR, 'utility_checkitems.json')
    with open(util_out, 'w', encoding='utf-8') as f:
        json.dump(util_items, f, indent=2, ensure_ascii=False)
    print(f' Saved {len(util_items)} Utility items -> {util_out}')

    print('Parsing FACILITY sheet...')
    fac_items = parse_facility_sheet(wb)
    fac_out = os.path.join(OUTPUT_DIR, 'facility_checkitems.json')
    with open(fac_out, 'w', encoding='utf-8') as f:
        json.dump(fac_items, f, indent=2, ensure_ascii=False)
    print(f' Saved {len(fac_items)} Facility items -> {fac_out}')

    print('\n All data exported successfully! Ready for database seeding.')

if __name__ == '__main__':
    main()

