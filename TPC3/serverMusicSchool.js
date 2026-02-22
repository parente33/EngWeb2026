const axios = require('axios')
const http = require('http')
const utils = require('./myUtils.js')

// ------------------- MAIN ------------------- //

var myServer = http.createServer(async function (req, res) {
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + ' ' + req.url + ' ' + d)

    switch (req.method) {
        case "GET":
            // Página principal
            if (req.url == "/") {
                try {
                    var corpo = `
                        <h1>Escola de música</h1>
                        <h2>Alunos:</h2>${utils.botao('/alunos', 'Alunos')}
                        <h2>Cursos:</h2>${utils.botao('/cursos', 'Cursos')}
                        <h2>Instrumentos:</h2>${utils.botao('/instrumentos', 'Instrumentos')}
                    `

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(utils.pagina('Página Inicial', corpo))
                }
                catch (erro) {
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<pre>Erro no servidor de dados: ${erro}.</pre>`)
                }
            }
            // Página dos alunos
            else if (req.url == '/alunos') {
                try {
                    var alunos = await utils.getAlunos()
                    var linhas = alunos.map(a => `
                        <tr>
                            <th>${a.id}</th>
                            <th>${a.nome}</th>
                            <th>${a.dataNasc}</th>
                            <th>${a.curso}</th>
                            <th>${a.anoCurso}</th>
                            <th>${a.instrumento}</th>
                        </tr>
                    `).join('')

                    var corpo = utils.card('Lista dos Alunos', `
                        <table class=w3-table w3-striped w3-bordered w3-hoverable>
                            <tr class=w3-light-grey>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Data de Nascimento</th>
                                <th>Curso</th>
                                <th>Ano de Curso</th>
                                <th>Instrumento</th>
                            </tr>
                            ${linhas}
                        </table>
                        ${utils.botaoVoltar()}
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(utils.pagina('Página dos Alunos', corpo))
                }
                catch (erro) {
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro no servidor de dados: ${erro}.</p>`)
                }
            }
            // Página dos cursos
            else if (req.url == '/cursos') {
                try {
                    var cursos = await utils.getCursos()
                    var linhas = cursos.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.designacao}</td>
                            <td>${c.duracao}</td>
                            <td>${c.instrumento['id']}</td>
                            <td>${c.instrumento['#text']}</td>
                        </tr>
                    `).join('')

                    var corpo = utils.card('Lista dos Cursos', `
                        <table class=w3-table w3-striped w3-bordered w3-hoverable>
                            <tr class=w3-light-grey>
                                <th>ID do Curso</th>
                                <th>Designação</th>
                                <th>Duração</th>
                                <th>ID do Instrumento</th>
                                <th>Nome do Instrumento</th>
                            </tr>
                            ${linhas}
                        </table>
                        ${utils.botaoVoltar()}
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(utils.pagina('Página dos Cursos', corpo))
                }
                catch (erro) {
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro no servidor de dados: ${erro}.</p>`)
                }
            }
            // Página dos instrumentos
            else if (req.url == '/instrumentos') {
                try {
                    var instrumentos = await utils.getInstrumentos()
                    var linhas = instrumentos.map(i => `
                        <tr>
                            <td>${i.id}</td>
                            <td>${i['#text']}</td>
                        </tr>
                    `).join('')

                    var corpo = utils.card('Lista dos Instrumentos', `
                        <table class=w3-table w3-striped w3-bordered w3-hoverable>
                            <tr class=w3-light-grey>
                                <th>ID</th>
                                <th>Nome do Instrumento</th>
                            </tr>
                            ${linhas}
                        </table>
                        ${utils.botaoVoltar()}
                    `)

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(utils.pagina('Página dos Instrumentos', corpo))
                }
                catch (erro) {
                    res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.end(`<p>Erro no servidor de dados: ${erro}.</p>`)
                }
            }
            else {
                res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' })
                res.end(`<p>Método não suportado: ${req.method}</p>`)
            }
            break
        default:
            res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`<p>Rota não suportada: ${req.url}</p>`)
            break
    }
})

myServer.listen(7777)
console.log("Servidor à escuta na porta 7777...")