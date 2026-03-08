## TPC5

# MetaInformação

Título: Criação de uma aplicação web para gestão de um cinema, com filmes, atores e géneros

Data: 08/03/2026

Autor: Daniel Parente

UC: Engenharia Web

# Resumo

- Colocar no json-server o dataset de cinema;

- Usar o express p/ criar uma aplicação web:

    - GET / ou /filmes => tabela com [ id (acrescentar ao dataset) | titulo | ano | #generos | #cast ]

    - GET /filmes/:id => toda a informação do filme

    - GET /atores => tabela com [ id | ator | #filmes ]

    - GET /atores/:id => toda a informação do ator

    - GET /generos => tabela com [ id | genero | #filmes ]

    - GET /generos/:id => toda a informação do género


# Lista de Resultados

[views](./cinema/views): Diretório com os ficheiros .pug para gerar as páginas HTML;

[routes](./cinema/routes): Diretório com o ficheiro .js que responde aos pedidos

[cinema.json](cinema.json): Dataset não trabalhado, e não apropriado para usar em servidores;

[new_cinema.json](new_cinema.json): Dataset convertido;

[handle_json.py](cinema/handle_json.py): Ficheiro que trata de converter o dataset (cinema.json) não apropriado, para um (new_cinema.json) apropriado para se usar;

# Para correr

Precisa de ter instalado:

- json-server:

```console
npm install -g json-server@0.17.4
```

Outras dependências podem ser instaladas recorrendo aos comandos:

```console
cd cinema/
npm install
```

Depois é só correr:

```console
json-server --watch new_cinema.json
cd cinemas/
npm start
```

e abrir o browser em http://localhost:7777/ para navegar!

Nota:

Se por algum motivo não tiver acesso ao dataset apropriado (new_cinema.json), primeiro deve correr:

```console
python3 cinema/handle_json.py
```