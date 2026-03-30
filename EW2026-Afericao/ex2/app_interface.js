const express = require('express');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// Configurações do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

const API_URL = process.env.API_URL || "http://localhost:16025";

app.get('/', (req, res) => {
     const d = new Date().toISOString().substring(0, 16);

     // Faz o pedido à API de dados
     axios.get(API_URL+'/repairs')
          .then(response => {
               res.render('index', {
                    repairs: response.data,
                    date: d
               });
          })
          .catch(err => {
               res.render('error', {
                    error: err,
                    message: "Erro ao obter dados da API"
               });
          });
});

app.get('/:param', (req, res) => {
    const param = req.params.param;

    if (mongoose.Types.ObjectId.isValid(param)) {
        axios.get(API_URL + '/repairs/' + param)
            .then(response => res.render('repair', { repair: response.data }))
            .catch(err => res.render('error', { error: err }));
    } else {
        axios.get(API_URL + '/repairs?marca=' + param)
            .then(response => res.render('marca', { repairs: response.data, marca: param }))
            .catch(err => res.render('error', { error: err }));
    }
});

const PORT = 16026;
app.listen(PORT, () => {
     console.log(`Servidor de Interface em http://localhost:${PORT}`);
});
