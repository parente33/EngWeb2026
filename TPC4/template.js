const pug = require('pug');

function renderPug(fileName, data) {
    return pug.renderFile(`./views/${fileName}.pug`, data);
}

exports.tabelaEMD = (lista) =>
    renderPug('index', { list: lista });

exports.cartaoEMD = (emd) =>
    renderPug('emd', { emd: emd });

exports.formularioEMD = (exame = null) =>
    renderPug('form', { exame: exame });

exports.estatisticasEMD = (generos, modalidades, clubes, resultados, federados) =>
    renderPug('stats', { generos, modalidades, clubes, resultados, federados });

exports.paginaErro = (mensagem) =>
    renderPug('error', { message: mensagem });