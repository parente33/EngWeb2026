import json
import os

INPUT_FILE = "cinema.json"
OUTPUT_DIR = "./collections"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Abrir o ficheiro
def load_data():
    with open(INPUT_FILE, encoding="utf-8") as c:
        return json.load(c)

def process():
    data = load_data()

    filmes = []
    atores_dict = {}
    generos_dict = {}

    for i, filme in enumerate(data["filmes"], start = 1):
        
        filme["_id"] = str(i)
        filmes.append(filme)

        titulo = filme.get("title")

        # atores
        for ator in filme.get("cast", []):
            
            if ator not in atores_dict:
                atores_dict[ator] = {
                    "_id": str(len(atores_dict) + 1),
                    "name": ator,
                    "films": []
                }

            atores_dict[ator]["films"].append({
                "_id": str(i),
                "title": titulo
            })

        # generos
        for genero in filme.get("genres", []):

            if genero not in generos_dict:
                generos_dict[genero] = {
                    "_id": str(len(generos_dict) + 1),
                    "name": genero,
                    "films": []
                }

            generos_dict[genero]["films"].append({
                "_id": str(i),
                "title": titulo
            })

    atores = list(atores_dict.values())
    generos = list(generos_dict.values())

    save("filmes.json", filmes)
    save("atores.json", atores)
    save("generos.json", generos)

def save(name, data):
    path = os.path.join(OUTPUT_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    process()
