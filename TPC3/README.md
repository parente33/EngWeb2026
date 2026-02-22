## TPC3

# MetaInformação

Título: Criação de um servidor aplicacional para responder a diversos serviços

Data: 22/02/2026

Autor: Daniel Parente

UC: Engenharia Web

# Resumo

Criar um json-server com o dataset da escola de música;

Criar um servidor aplicacional para responder aos seguintes serviços:

- ./alunos - Tabela HTML com os dados de todos os alunos;

- ./cursos - Tabela HTML com os a informação de todos os cursos;

- ./instrumentos - Tabela HTML com os dados dos vários instrumentos.

# Lista de Resultados

[musicSchool.json](musicSchool.json): dataset fornecido.

[myUtils.js](myUtils.js): ficheiro JavaScript com algumas funções auxiliares.

[serverMusicSchool.js](serverMusicSchool.js): servidor aplicacional desenvolvido.

# Para correr

Precisa de ter instalado:

- json-server:

```console
npm install -g json-server@0.17.4
```

e

- axios:
```console
npm install axios
```

Depois, abrir um terminal e escrever:

```console
json-server --watch musicSchool.json
```

e noutro terminal:

```console
node serverMusicSchool.js
```

Com isso feito, é só abrir o seu browser e procurar pela rota principal:

- http://localhost:7777/

ou, pelas rotas secundárias (igualmente acessíveis pela rota principal):

- http://localhost:7777/alunos

- http://localhost:7777/cursos

- http://localhost:7777/instrumentos
