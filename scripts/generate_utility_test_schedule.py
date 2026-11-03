import json
import datetime
from collections import defaultdict, Counter

with open('backend/data/utility_checkitems.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

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

# Simulate year 2026
start = datetime.date(2026, 1, 1)
end = datetime.date(2026, 12, 31)
cur = start

dates_info = []

while cur <= end:
    yr = cur.year
    mo = cur.month
    dt = cur.day
    dw = (cur.weekday() + 1) % 7 # 0=Sun, 1=Mon, ..., 6=Sat
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
            'items': matching_items
        })
    cur += datetime.timedelta(days=1)

print(f'Total active maintenance dates in 2026: {len(dates_info)}')

by_month = defaultdict(list)
for d in dates_info:
    by_month[d['m']].append(d)

for m in sorted(by_month.keys()):
    month_name = datetime.date(2026, m, 1).strftime('%B')
    print(f'\n=== {month_name} 2026 ({len(by_month[m])} active dates) ===')
    for d in by_month[m]:
        plant_summary = ', '.join([f'{k}: {v}' for k, v in d['plants'].items()])
        print(f"  {d['date']} ({d['day_name']}) | Total Cards: {d['total']:2d} [Maint(P): {d['p_count']:2d}, Serv(S): {d['s_count']:2d}] | Plants: {plant_summary}")

# Also output summary stats:
all_card_ids = set()
for d in dates_info:
    for it in d['items']:
        all_card_ids.add((it['line'], it['processNo'], it['workDetail']))

print(f'\nUnique cards appearing in 2026: {len(all_card_ids)} / {len(items)}')
missing = []
for it in items:
    if (it['line'], it['processNo'], it['workDetail']) not in all_card_ids:
        missing.append(it)
print(f'Cards not appearing in 2026: {len(missing)}')
for m_it in missing:
    print(f"  Not in 2026: {m_it['processNo']} | {m_it['workDetail']} | y={m_it['y']}")

