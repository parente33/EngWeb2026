var http = require('http')
var axios = require('axios')
var url = require('url')
var { parse } = require('querystring')

var templates = require('./template.js')
var staticFiles = require('./static.js')

function collectRequestBodyData(request, callback) {
    if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => { body += chunk.toString(); });
        request.on('end', () => {
            let raw = parse(body);
            let processed = {};

            for (let key in raw) {
                if (key === 'federado' || key === 'resultado') {
                    processed[key] = raw[key] === 'true' || raw[key] === 'on' || raw[key] === '1';
                } else {
                    processed[key] = raw[key];
                }
            }

            // Garante que checkboxes não enviados ficam false
            if (processed.federado === undefined) processed.federado = false;
            if (processed.resultado === undefined) processed.resultado = false;

            callback(processed);
        });
    } else {
        callback(null);
    }
}

var emdServer = http.createServer((req, res) => {
    var d = new Date().toISOString().substring(0, 16);
    console.log(req.method + ' ' + req.url + ' ' + d);

    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;

    // Recursos estáticos (css, imagens, etc.)
    if (staticFiles.staticResource(req)) {
        staticFiles.serveStaticResource(req, res);
        return;
    }

    switch (req.method) {

        // ----------------------------------------------------------------
        case 'GET':

            // GET / ou GET /emd
            if (pathname === '/' || pathname === '/emd') {
                var sort  = parsedUrl.query.sort  || 'dataEMD';
                var order = parsedUrl.query.order || 'asc';

                axios.get(`http://localhost:3000/emd?_sort=${sort}&_order=${order}`)
                    .then(resp => {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.tabelaEMD(resp.data));
                    })
                    .catch(erro => {
                        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Erro ao obter registos: ' + erro.message));
                    });
            }

            // GET /emd/stats
            else if (pathname === '/emd/stats') {
                axios.get('http://localhost:3000/emd')
                    .then(resp => {
                        var exames = resp.data;
                        var generos     = {};
                        var modalidades = {};
                        var clubes      = {};
                        var resultados  = {};
                        var federados   = {};

                        exames.forEach(e => {
                            // Sexo / género
                            var g = e.genero || e.género || 'Desconhecido';
                            generos[g] = (generos[g] || 0) + 1;

                            // Modalidade
                            var m = e.modalidade || 'Desconhecida';
                            modalidades[m] = (modalidades[m] || 0) + 1;

                            // Clube
                            var c = e.clube || 'Desconhecido';
                            clubes[c] = (clubes[c] || 0) + 1;

                            // Resultado
                            var r = e.resultado ? 'Apto' : 'Não Apto';
                            resultados[r] = (resultados[r] || 0) + 1;

                            // Federado
                            var f = e.federado ? 'Sim' : 'Não';
                            federados[f] = (federados[f] || 0) + 1;
                        });

                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.estatisticasEMD(generos, modalidades, clubes, resultados, federados));
                    })
                    .catch(erro => {
                        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Erro ao calcular estatísticas: ' + erro.message));
                    });
            }

            // GET /emd/registo
            else if (pathname === '/emd/registo') {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(templates.formularioEMD());
            }

            // GET /emd/apagar/:id
            else if (/^\/emd\/apagar\/[0-9a-zA-Z_]+$/.test(pathname)) {
                var id = pathname.split('/')[3];
                axios.delete('http://localhost:3000/emd/' + id)
                    .then(() => {
                        res.writeHead(302, { 'Location': '/emd' });
                        res.end();
                    })
                    .catch(erro => {
                        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Erro ao apagar registo: ' + erro.message));
                    });
            }

            // GET /emd/editar/:id
            else if (/^\/emd\/editar\/[0-9a-zA-Z_]+$/.test(pathname)) {
                var id = pathname.split('/')[3];
                axios.get('http://localhost:3000/emd/' + id)
                    .then(resp => {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.formularioEMD(resp.data));
                    })
                    .catch(erro => {
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Registo não encontrado: ' + erro.message));
                    });
            }

            // GET /emd/:id
            else if (/^\/emd\/[0-9a-zA-Z_]+$/.test(pathname)) {
                var id = pathname.split('/')[2];
                axios.get('http://localhost:3000/emd/' + id)
                    .then(resp => {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.cartaoEMD(resp.data));
                    })
                    .catch(erro => {
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Registo não encontrado: ' + erro.message));
                    });
            }

            // Rota desconhecida
            else {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(templates.paginaErro('Rota não encontrada: ' + pathname));
            }
            break;

        // ----------------------------------------------------------------
        case 'POST':

            // POST /emd
            if (pathname === '/emd') {
                collectRequestBodyData(req, result => {
                    if (result) {
                        axios.post('http://localhost:3000/emd', result)
                            .then(() => {
                                res.writeHead(302, { 'Location': '/emd' });
                                res.end();
                            })
                            .catch(erro => {
                                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                                res.end(templates.paginaErro('Erro ao inserir registo: ' + erro.message));
                            });
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Não foi possível ler os dados do formulário.'));
                    }
                });
            }

            // POST /emd/:id
            else if (/^\/emd\/[0-9a-zA-Z_]+$/.test(pathname)) {
                var id = pathname.split('/')[2];
                collectRequestBodyData(req, result => {
                    if (result) {
                        axios.put('http://localhost:3000/emd/' + id, result)
                            .then(() => {
                                res.writeHead(302, { 'Location': '/emd' });
                                res.end();
                            })
                            .catch(erro => {
                                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                                res.end(templates.paginaErro('Erro ao atualizar registo: ' + erro.message));
                            });
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(templates.paginaErro('Não foi possível ler os dados do formulário.'));
                    }
                });
            }

            else {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(templates.paginaErro('Rota POST não encontrada: ' + pathname));
            }
            break;

        // ----------------------------------------------------------------
        default:
            res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(templates.paginaErro('Método não suportado: ' + req.method));
    }
});

emdServer.listen(7777, () => {
    console.log('Servidor EMD à escuta na porta 7777...');
});