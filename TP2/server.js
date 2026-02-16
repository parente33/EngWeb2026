const http = require("http")
const axios = require("axios")
const url = require("url")

const API = "http://localhost:3000/reparacoes"


function pageTemplate(title, body) {
  return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8"/>
            <title>${title}</title>
        </head>
        <body>
            <h1>${title}</h1>
            ${body}
        </body>
    </html>
  `
}

http.createServer(async (req, res) => {

  const q = url.parse(req.url, true)

  if (q.pathname === "/reparacoes") {

    const response = await axios.get(API)
    const dados = response.data

    let table = `
      <table border="1">
        <tr>
          <th>Nome</th>
          <th>NIF</th>
          <th>Data</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Matrícula</th>
          <th>Nº Intervenções</th>
        </tr>
    `

    dados.forEach(r => {
      table += `
        <tr>
          <td>${r.nome}</td>
          <td>${r.nif}</td>
          <td>${r.data}</td>
          <td>${r.viatura.marca}</td>
          <td>${r.viatura.modelo}</td>
          <td>${r.viatura.matricula}</td>
          <td>${r.nr_intervencoes}</td>
        </tr>
      `
    })

    table += "</table>"

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(pageTemplate("Lista de Reparações", table))
  }

  else if (q.pathname === "/intervencoes") {

    const response = await axios.get(API)
    const dados = response.data

    let mapa = {}

    dados.forEach(r => {
      r.intervencoes.forEach(i => {
        if (!mapa[i.codigo]) {
          mapa[i.codigo] = { nome: i.nome, descricao: i.descricao, total: 0 }
        }
        mapa[i.codigo].total++
      })
    })

    let table = `
      <table border="1">
        <tr>
          <th>Código</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Nº de vezes</th>
        </tr>
    `

    Object.entries(mapa).forEach(([codigo, info]) => {
      table += `
        <tr>
          <td>${codigo}</td>
          <td>${info.nome}</td>
          <td>${info.descricao}
          <td>${info.total}</td>
        </tr>
      `
    })

    table += "</table>"

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(pageTemplate("Intervenções", table))
  }

  else if (q.pathname === "/viaturas") {

    const response = await axios.get(API)
    const dados = response.data

    let mapa = {}

    dados.forEach(r => {
      const chave = `${r.viatura.marca}|||${r.viatura.modelo}`

      if (!mapa[chave]) {
        mapa[chave] = 0
      }

      mapa[chave]++
    })

    let table = `
      <table border="1">
        <tr>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Nº Reparações</th>
        </tr>
    `

    Object.entries(mapa).forEach(([chave, total]) => {
      const [marca, modelo] = chave.split("|||")

      table += `
        <tr>
          <td>${marca}</td>
          <td>${modelo}</td>
          <td>${total}</td>
        </tr>
      `
    })

    table += "</table>"

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(pageTemplate("Viaturas Intervencionadas", table))
  }

  else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("Rota não suportada")
  }

}).listen(4000)

console.log("Servidor na porta 4000")