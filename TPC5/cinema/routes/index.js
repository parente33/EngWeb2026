var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  res.render('index', { date: d });
});

/* GET all films page. */
router.get('/filmes', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get("http://localhost:3000/filmes?_sort=title")
    .then(resp => {
      var filmes = resp.data
      res.render('filmes', { filmes: filmes, date: d })
    })
    .catch(err => {
      res.status(500).render('error', {error: err})
    })
});

/* GET individual film page. */
router.get('/filmes/:id', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/filmes/' + req.params.id)
    .then(filmeResp => {
      var filme = filmeResp.data
      // Fetch actor and genre objects so we can link by their numeric IDs
      var atoresPromises = filme.cast.map(function(nomeAtor) {
        return axios.get('http://localhost:3000/atores?actor=' + encodeURIComponent(nomeAtor))
          .then(function(r) { return r.data[0] || null })
          .catch(function() { return null })
      })
      var generosPromises = filme.genres.map(function(nomeGenero) {
        return axios.get('http://localhost:3000/generos?genre=' + encodeURIComponent(nomeGenero))
          .then(function(r) { return r.data[0] || null })
          .catch(function() { return null })
      })
      return Promise.all([
        Promise.all(atoresPromises),
        Promise.all(generosPromises)
      ]).then(function(results) {
        var atores = results[0].filter(Boolean)
        var generos = results[1].filter(Boolean)
        res.render('filme', { filme: filme, atores: atores, generos: generos, date: d })
      })
    })
    .catch(err => {
      res.status(500).render('error', { error: err })
    })
});

/* GET all actors page. */
router.get('/atores', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get("http://localhost:3000/atores?_sort=actor")
    .then(resp => {
      var atores = resp.data
      res.render('atores', { atores: atores, date: d })
    })
    .catch(err => {
      res.status(500).render('error', {error: err})
    })
});

/* GET individual actor page. */
router.get('/atores/:id', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/atores/' + req.params.id)
    .then(atorResp => {
      var ator = atorResp.data
      // Fetch the film objects for each movie ID in ator.movies
      var filmesPromises = ator.movies.map(function(filmeId) {
        return axios.get('http://localhost:3000/filmes/' + filmeId)
          .then(function(r) { return r.data })
          .catch(function() { return null })
      })
      return Promise.all(filmesPromises).then(function(filmes) {
        filmes = filmes.filter(Boolean)
        res.render('ator', { ator: ator, filmes: filmes, date: d })
      })
    })
    .catch(err => {
      res.status(500).render('error', { error: err })
    })
});

/* GET all genres page. */
router.get('/generos', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get("http://localhost:3000/generos?_sort=genre")
    .then(resp => {
      var generos = resp.data
      res.render('generos', { generos: generos, date: d })
    })
    .catch(err => {
      res.status(500).render('error', {error: err})
    })
});

/* GET individual genre page. */
router.get('/generos/:id', function(req, res, next) {
  var d = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/generos/' + req.params.id)
    .then(generoResp => {
      var genero = generoResp.data
      // Fetch the film objects for each movie ID in genero.movies
      var filmesPromises = genero.movies.map(function(filmeId) {
        return axios.get('http://localhost:3000/filmes/' + filmeId)
          .then(function(r) { return r.data })
          .catch(function() { return null })
      })
      return Promise.all(filmesPromises).then(function(filmes) {
        filmes = filmes.filter(Boolean)
        res.render('genero', { genero: genero, filmes: filmes, date: d })
      })
    })
    .catch(err => {
      res.status(500).render('error', { error: err })
    })
});

module.exports = router;