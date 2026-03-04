## TPC4

# MetaInformação

Título: Criação de uma aplicação web para gestão de Exames Médicos Desportivos

Data: 03/03/2026

Autor: Daniel Parente

UC: Engenharia Web

# Resumo

No seguimento da aula prática onde se realizaram:

- Colocação do dataset dos EMD no json-server;

- Criação de um servidor aplicacional para responder aos pedidos:

- GET / ou GET /emd - responde com uma página principal onde consta uma tabela com os EMD; a tabela apresenta os campos: nome do atleta, data, modalidade, resultado;

- GET /emd/:id - responde com uma página composta por um card com toda a informação do EMD;

- Da tabela deve ser possível saltar para a página de um EMD clicando na respetiva linha;

- A página do EMD deverá ter um botão "Voltar" no seu rodapé;

Como extra na aula, poderás acrescentar dois botões na parte superior da tabela, um para ordenar os registos por data de forma decrescente e outro para os ordenar por nome de forma crescente.

Como trabalho de casa deverás suportar as seguintes rotas:

- GET /emd/registo - responde com o formulário para recolha dos dados do novo EMD;

- GET /emd/editar/:id - responde com o formulário para edição dos dados do registo selecionado;

- GET /emd/apagar/:id - apaga o registo selecionado e redireciona para a página principal;

- GET /emd/stats - responde com uma página (layout à tua escolha) com as distribuições dos registos por: sexo, modalidade, clube, resultado, federado;

- POST /emd - insere o registo na base de dados e redireciona para a página principal;

- POST /emd/:id - altera o registo na base de dados e redireciona para a página principal.

# Lista de Resultados

[views](./views): Diretório com os ficheiros .pug para gerar as páginas HTML;

[emd.json](emd.json): Dataset não trabalhado, e não apropriado para usar em servidores;

[emd_handled.json](emd_handled.json): Dataset convertido;

[json_handler.py](json_handler.py): Ficheiro que trata de converter o dataset (emd.json) não apropriado, para um (emd_handled.json) apropriado para se usar;

[server.js](server.js): Ficheiro que implementa o servidor aplicacional;

[static.js](static.js):

[template.js](template.js):

# Para correr

Precisa de ter instalado:

- json-server:

```console
npm install -g json-server@0.17.4
```

- axios:
```console
npm install axios
```

e

- pug:
```console
npm install pug
```

Depois, abrir um terminal e escrever:

```console
json-server --watch emd_handled.json
```

e noutro terminal:

```console
node server.js
```

Com isso feito, é só abrir o seu browser e procurar pela rota principal:

- http://localhost:7777/

Nota:

Se por algum motivo não tiver acesso ao dataset apropriado (emd_handled.json), primeiro deve correr:

```console
python3 json_handler.py
```
