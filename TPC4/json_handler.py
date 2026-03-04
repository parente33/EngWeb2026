import json

old = []

with open("emd.json", "r", encoding="utf-8") as f:
    data = json.load(f)
    for d in data:
        athlete = d.copy()
        athlete['id'] = athlete.pop('_id')
        old.append(athlete)

new = {}
new['emd'] = old

with open("emd_handled.json", "w", encoding="utf-8") as f:
    json.dump(new, f, ensure_ascii=False, indent=2)