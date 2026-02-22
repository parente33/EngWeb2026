import json, os, shutil

# ----------------------------------------- FUNÇÕES AUXILIARES ----------------------------------------- #

def open_json(filename):
    with open(filename, encoding="utf-8") as f:
        data = json.load(f)
    return data

def mk_dir(relative_path):
    if not os.path.exists(relative_path):
        os.mkdir(relative_path)
    else:
        shutil.rmtree(relative_path)
        os.mkdir(relative_path)

def new_file(filename, content):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

# ----------------------------------------- PRÉ-CALCULAÇÕES ----------------------------------------- #

dataset = open_json("dataset_reparacoes.json")
reparacoes = dataset["reparacoes"]

mk_dir("output")
mk_dir("output/reparacoes")
mk_dir("output/intervencoes")
mk_dir("output/carros")

intervencoes = {}
intervencao_reps = {}
carros = {}
carro_matriculas = {}

# ----------------------------------------- PÁGINA INICIAL ----------------------------------------- #

html = f'''
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Website Reparações</title>
            </head>
            <body>
                <h3>Exploração do Dataset</h3>
                <ul>
                    <li><a href="reparacoes/index.html">Reparações</a></li>
                    <li><a href="intervencoes/index.html">Tipos de intervenção</a></li>
                    <li><a href="carros/index.html">Marcas e modelos</a></li>
                </ul>
            </body>
        </html>
        '''

new_file("output/index.html", html)

# ----------------------------------------- PÁGINAS DE REPARAÇÕES ----------------------------------------- #

for i, r in enumerate(reparacoes):
    marca = r["viatura"]["marca"]
    modelo = r["viatura"]["modelo"]

    carros[(marca, modelo)] = carros.get((marca, modelo), 0) + 1

    for it in r["intervencoes"]:
        cod = it["codigo"]
        intervencoes[cod] = it
        intervencao_reps.setdefault(cod, []).append(i)

linhas = ""
for i, r in enumerate(reparacoes):
    linhas += f'''
        <tr>
            <td>{r["data"]}</td>
            <td>{r["nif"]}</td>
            <td><a href="rep_{i}.html">{r["nome"]}</a></td>
            <td>{r["viatura"]["marca"]}</td>
            <td>{r["viatura"]["modelo"]}</td>
            <td>{r["nr_intervencoes"]}</td>
        </tr>
    '''

html = f'''
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Reparações</title>
            </head>
            <body>
                <h3>Lista de Reparações</h3>
                <table border="1">
                    <tr>
                        <th>Data</th>
                        <th>NIF</th>
                        <th>Nome</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th># Intervenções</th>
                    </tr>
                    {linhas}
                </table>
                <hr/>
                <a href="../index.html">Voltar ao índice</a>
            </body>
        </html>
        '''

new_file("output/reparacoes/index.html", html)

# ----------------------------------------- PÁGINAS DE REPARAÇÃO ----------------------------------------- #

for i, r in enumerate(reparacoes):
    lista = ""
    for it in r["intervencoes"]:
        lista += f'''
            <li>
                <a href="../intervencoes/{it["codigo"]}.html">
                    {it["codigo"]} - {it["nome"]}
                </a>
            </li>
        '''

    html = f'''
            <html>
                <head>
                    <meta charset="utf-8"/>
                    <title>Reparação></title>
                </head>
                <body>
                    <h3>Reparação</h3>
                    <table border="1">
                        <tr><td>Nome</td><td>{r["nome"]}</td></tr>
                        <tr><td>NIF</td><td>{r["nif"]}</td></tr>
                        <tr><td>Data</td><td>{r["data"]}</td></tr>
                        <tr><td>Viatura</td><td>{r["viatura"]["marca"]} {r["viatura"]["modelo"]}</td></tr>
                        <tr><td>Matrícula</td><td>{r["viatura"]["matricula"]}</td></tr>
                    </table>

                    <h4>Intervenções</h4>
                    <ul>{lista}</ul>
                    <hr/>
                    <a href="../index.html">Voltar ao índice</a>
                </body>
            </html>
            '''

    new_file(f"output/reparacoes/rep_{i}.html", html)

# ----------------------------------------- PÁGINAS DE TIPOS DE INTERVENÇÕES ----------------------------------------- #

lista = ""
for cod in sorted(intervencoes):
    lista += f'<li><a href="{cod}.html">{cod}</a></li>'

html = f"""
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Intervenções</title>
            </head>
            <body>
                <h3>Tipos de Intervenção</h3>
                <ul>{lista}</ul>
                <hr/>
                <a href="../index.html">Voltar ao índice</a>
            </body>
        </html>
        """

new_file("output/intervencoes/index.html", html)

for cod, it in intervencoes.items():
    lista = ""
    for i in intervencao_reps[cod]:
        lista += f'<li><a href="../reparacoes/rep_{i}.html">Reparação {i}</a></li>'

    html = f"""
            <html>
                <head>
                    <meta charset="utf-8"/>
                    <title>{cod}</title>
                </head>
                <body>
                    <h3>{it["nome"]}</h3>
                    <p><b>Código:</b> {cod}</p>
                    <p><b>Descrição:</b> {it["descricao"]}</p>
                    <h4>Reparações</h4>
                    <ul>{lista}</ul>
                    <hr/>
                    <a href="index.html">Voltar</a>
                </body>
            </html>
            """

    new_file(f"output/intervencoes/{cod}.html", html)

# ----------------------------------------- PÁGINAS DE MARCAS / MODELOS ----------------------------------------- #

for r in reparacoes:
    marca = r["viatura"]["marca"]
    modelo = r["viatura"]["modelo"]
    matricula = r["viatura"]["matricula"]

    chave = (marca, modelo)
    carro_matriculas.setdefault(chave, set()).add(matricula) # Uso de set evita duplicados

lista = ""
for (marca, modelo), n in sorted(carros.items()):
    nome = f"{marca}_{modelo}".replace(" ", "_")
    lista += f'<li><a href="{nome}.html">{marca} {modelo}</a> ({n})</li>'

html = f"""
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Marcas e Modelos</title>
            </head>
            <body>
                <h3>Marcas e Modelos</h3>
                <ul>{lista}</ul>
                <hr/>
                <a href="../index.html">Voltar ao índice</a>
            </body>
        </html>
        """

new_file("output/carros/index.html", html)

for (marca, modelo), n in carros.items():
    nome = f"{marca}_{modelo}".replace(" ", "_")
    lista_matriculas = ""
    for m in sorted(carro_matriculas[(marca, modelo)]):
        lista_matriculas += f"<li>{m}</li>"

    html = f"""
            <html>
                <head>
                    <meta charset="utf-8"/>
                    <title>{marca} {modelo}</title>
                </head>
                <body>
                    <h3>{marca} {modelo}</h3>
                    <p>Número de carros: {n}</p>

                    <h4>Matrículas intervencionadas</h4>
                    <ul>
                    {lista_matriculas}
                    </ul>

                    <hr/>
                    <a href="index.html">Voltar</a>
                </body>
            </html>
            """
    new_file(f"output/carros/{nome}.html", html)