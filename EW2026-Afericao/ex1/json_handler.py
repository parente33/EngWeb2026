import json

with open("dataset_reparacoes.json", "r", encoding="utf-8") as f:
    data = json.load(f)

reparacoes = data.get("reparacoes", [])

with open("repairs.json", "w", encoding="utf-8") as f:
    json.dump(reparacoes, f, indent=2, ensure_ascii=False)
