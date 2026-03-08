import json
from collections import defaultdict

with open("cinema.json", "r", encoding="utf-8") as f:
    data = json.load(f)

filmes = data["filmes"]

atores_dict = defaultdict(list)
generos_dict = defaultdict(list)

for i, filme in enumerate(filmes, start=1):
    filme["id"] = i

    for ator in filme["cast"]:
        atores_dict[ator].append(i)

    for genero in filme["genres"]:
        generos_dict[genero].append(i)

# criar lista de atores
atores = []
for i, (ator, lista_filmes) in enumerate(sorted(atores_dict.items()), start=1):
    atores.append({
        "id": i,
        "actor": ator,
        "movies": lista_filmes
    })

# criar lista de generos
generos = []
for i, (genero, lista_filmes) in enumerate(sorted(generos_dict.items()), start=1):
    generos.append({
        "id": i,
        "genre": genero,
        "movies": lista_filmes
    })

# json final
db = {
    "filmes": filmes,
    "atores": atores,
    "generos": generos
}

with open("new_cinema.json", "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2, ensure_ascii=False)