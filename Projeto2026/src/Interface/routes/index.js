const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL  = process.env.API_URL  || 'http://localhost:3001';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3002';

// Middleware local — injeta o utilizador autenticado em todas as views
router.use((req, res, next) => {
  res.locals.utilizador = req.session.utilizador || null;
  res.locals.token      = req.session.token      || null;
  next();
});

// Helper — cabeçalho Authorization para pedidos à API
function authHeader(req) {
  return req.session.token ? { Authorization: `Bearer ${req.session.token}` } : {};
}


// ------------------------------------------------- Página inicial ------------------------------------------------- //

router.get('/', async (req, res, next) => {
  try {
    const date = new Date().toLocaleString('pt-PT', { hour12: false });
    const r = await axios.get(`${API_URL}/inquiricoes?limite=10`);
    res.render('index', {
      title: 'Inquirições de Génere',
      date,
      inquiricoes: r.data.dados,
      total: r.data.total
    });
  }
  catch (err) {
    next(err);
  }
});

// ---- Relações genealógicas ----
router.post('/inquiricoes/:proc_numero/relacoes/:proc_relacionado', async (req, res) => {
  try {
    const { proc_numero, proc_relacionado } = req.params;
    const r = await axios.post(
      `${API_URL}/inquiricoes/${proc_numero}/relacoes/${proc_relacionado}`,
      req.body,
      { headers: authHeader(req) }
    );
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ erro: err.response?.data?.erro || err.message });
  }
});

router.delete('/inquiricoes/:proc_numero/relacoes/:proc_relacionado', async (req, res) => {
  try {
    const { proc_numero, proc_relacionado } = req.params;
    await axios.delete(
      `${API_URL}/inquiricoes/${proc_numero}/relacoes/${proc_relacionado}`,
      { headers: authHeader(req) }
    );
    res.status(204).send();
  } catch (err) {
    res.status(err.response?.status || 500).json({ erro: err.response?.data?.erro || err.message });
  }
});

// ------------------------------------------------- Listagem e detalhe ------------------------------------------------- //

router.get('/inquiricoes', async (req, res, next) => {
  try {
    const date   = new Date().toLocaleString('pt-PT', { hour12: false });
    const params = new URLSearchParams();
    if (req.query.requerente) params.append('requerente', req.query.requerente);
    if (req.query.concelho)   params.append('concelho',   req.query.concelho);
    if (req.query.distrito)   params.append('distrito',   req.query.distrito);
    if (req.query.ano)        params.append('ano',        req.query.ano);
    if (req.query.texto)      params.append('texto',      req.query.texto);
    params.append('pagina', req.query.pagina || 1);
    params.append('limite', 20);

    const r = await axios.get(`${API_URL}/inquiricoes?${params}`);
    res.render('inquiricoes/lista', {
      title: 'Inquirições',
      date,
      inquiricoes: r.data.dados,
      total: r.data.total,
      pagina: r.data.pagina,
      limite: r.data.limite,
      query: req.query
    });
  }
  catch (err) {
    next(err);
  }
});

// Criar novo registo — antes de /:proc_numero para evitar colisão de rotas (admin only)
router.get('/inquiricoes/novo', (req, res) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('inquiricoes/form', { title: 'Novo Registo', date, inquiricao: null, erro: null });
});

router.post('/inquiricoes/novo', async (req, res) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  try {
    const r = await axios.post(`${API_URL}/inquiricoes`, req.body, { headers: authHeader(req) });
    res.redirect(`/inquiricoes/${r.data.proc_numero}`);
  }
  catch (err) {
    res.render('inquiricoes/form', {
      title: 'Novo Registo', date, inquiricao: req.body,
      erro: err.response?.data?.erro || 'Erro ao criar registo'
    });
  }
});

router.get('/inquiricoes/:proc_numero', async (req, res, next) => {
  try {
    const date = new Date().toLocaleString('pt-PT', { hour12: false });
    const erro = req.session.erro || null;
    delete req.session.erro;
    const [rInq, rPosts] = await Promise.all([
      axios.get(`${API_URL}/inquiricoes/${req.params.proc_numero}`),
      axios.get(`${API_URL}/inquiricoes/${req.params.proc_numero}/posts`)
    ]);
    res.render('inquiricoes/detalhe', {
      title: rInq.data.titulo,
      date,
      inquiricao: rInq.data,
      posts: rPosts.data.dados,
      erro
    });
  }
  catch (err) {
    next(err);
  }
});

// ------------------------------------------------- Índices ------------------------------------------------- //

router.get('/indice/nomes', async (req, res, next) => {
  try {
    const date = new Date().toLocaleString('pt-PT', { hour12: false });
    const r = await axios.get(`${API_URL}/inquiricoes/indice/nomes`);
    res.render('indices/nomes', { title: 'Índice Antroponímico', date, nomes: r.data });
  }
  catch (err) {
    next(err);
  }
});

router.get('/indice/lugares', async (req, res, next) => {
  try {
    const date = new Date().toLocaleString('pt-PT', { hour12: false });
    const r = await axios.get(`${API_URL}/inquiricoes/indice/lugares`);
    res.render('indices/lugares', { title: 'Índice Toponímico', date, lugares: r.data });
  }
  catch (err) {
    next(err);
  }
});

router.get('/indice/datas', async (req, res, next) => {
  try {
    const date = new Date().toLocaleString('pt-PT', { hour12: false });
    const r = await axios.get(`${API_URL}/inquiricoes/indice/datas`);
    res.render('indices/datas', { title: 'Índice Cronológico', date, anos: r.data });
  }
  catch (err) {
    next(err);
  }
});

// ------------------------------------------------- Edições ------------------------------------------------- //

// Editar registo (admin only)
router.get('/inquiricoes/:proc_numero/editar', async (req, res, next) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  try {
    const date = new Date().toLocaleString('pt-PT', { hour12: false });
    const r = await axios.get(`${API_URL}/inquiricoes/${req.params.proc_numero}`);
    res.render('inquiricoes/form', { title: 'Editar Registo', date, inquiricao: r.data, erro: null });
  }
  catch (err) {
    next(err);
  }
});

router.post('/inquiricoes/:proc_numero/editar', async (req, res, next) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  const proc_numero = req.params.proc_numero;
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  try {
    await axios.put(`${API_URL}/inquiricoes/${proc_numero}`, req.body, { headers: authHeader(req) });
    res.redirect(`/inquiricoes/${proc_numero}`);
  }
  catch (err) {
    res.render('inquiricoes/form', {
      title: 'Editar Registo', date, inquiricao: { ...req.body, proc_numero },
      erro: err.response?.data?.erro || 'Erro ao atualizar registo'
    });
  }
});

// Apagar registo (admin only)
router.post('/inquiricoes/:proc_numero/apagar', async (req, res) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  try {
    await axios.delete(`${API_URL}/inquiricoes/${req.params.proc_numero}`, { headers: authHeader(req) });
    res.redirect('/inquiricoes');
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao apagar registo';
    req.session.save(() => res.redirect(`/inquiricoes/${req.params.proc_numero}`));
  }
})

// Apagar post (admin only)
router.post('/posts/:id/apagar', async (req, res) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  const proc_numero = req.body.proc_numero;
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`, { headers: authHeader(req) });
    delete req.session.erro;
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao apagar post';
  }
  req.session.save(() => res.redirect(`/inquiricoes/${proc_numero}`));
});

// Apagar comentário (admin only)
router.post('/posts/:id/comentarios/:comentarioId/apagar', async (req, res) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  const proc_numero = req.body.proc_numero;
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}/comentarios/${req.params.comentarioId}`, { headers: authHeader(req) });
    delete req.session.erro;
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao apagar comentário';
  }
  req.session.save(() => res.redirect(`/inquiricoes/${proc_numero}`));
});

// ------------------------------------------------- Posts ------------------------------------------------- //

router.post('/inquiricoes/:proc_numero/posts', async (req, res, next) => {
  const proc_numero = req.params.proc_numero;
  try {
    await axios.post(
      `${API_URL}/inquiricoes/${proc_numero}/posts`,
      req.body,
      { headers: authHeader(req) }
    );
    delete req.session.erro;
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao publicar post';
  }
  req.session.save(() => res.redirect(`/inquiricoes/${proc_numero}`));
});

router.post('/posts/:id/comentarios', async (req, res, next) => {
  const proc_numero = req.body.proc_numero;
  try {
    await axios.post(
      `${API_URL}/posts/${req.params.id}/comentarios`,
      { texto: req.body.texto },
      { headers: authHeader(req) }
    );
    delete req.session.erro;
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao adicionar comentário';
  }
  req.session.save(() => {
    if (proc_numero) res.redirect(`/inquiricoes/${proc_numero}`);
    else res.redirect('/inquiricoes');
  });
});

// ------------------------------------------------- Sugestões ------------------------------------------------- //

router.get('/sugestoes', async (req, res, next) => {
  if (!req.session.utilizador) return res.redirect('/login');
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  const erro = req.session.erro || null;
  delete req.session.erro;

  let sugestoes = [];
  if (req.session.utilizador.nivel === 'administrador') {
    try {
      const r = await axios.get(`${API_URL}/sugestoes`, { headers: authHeader(req) });
      sugestoes = r.data.dados;
    }
    catch (err) {
      /* ignora erros de listagem */
    }
  }
  req.session.save(() => {
    res.render('sugestoes', { title: 'Caixa de Sugestoes', date, sugestoes, erro });
  });
});

router.post('/sugestoes', async (req, res) => {
  if (!req.session.utilizador) return res.redirect('/login');
  try {
    await axios.post(`${API_URL}/sugestoes`, req.body, { headers: authHeader(req) });
    delete req.session.erro;
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao enviar sugestão';
  }
  req.session.save(() => res.redirect('/sugestoes'));
});

router.post('/sugestoes/:id/apagar', async (req, res) => {
  if (!req.session.utilizador || req.session.utilizador.nivel !== 'administrador') return res.redirect('/login');
  try {
    await axios.delete(`${API_URL}/sugestoes/${req.params.id}`, { headers: authHeader(req) });
    delete req.session.erro;
  }
  catch (err) {
    req.session.erro = err.response?.data?.erro || 'Erro ao apagar sugestão';
  }
  req.session.save(() => res.redirect('/sugestoes'));
});

// ------------------------------------------------- Perfil ------------------------------------------------- //

router.get('/perfil', async (req, res, next) => {
  if (!req.session.utilizador) return res.redirect('/login');
  const date = new Date().toLocaleDateString('pt-PT', { hour12: false });
  try {
    const perfilResp = await axios.get(`${AUTH_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    const user = perfilResp.data;

    // Buscar número de contribuições, apenas para admins
    let contribuicoes = null;
    if (user.nivel === 'administrador') {
      try {
        const contribResp = await axios.get(`${API_URL}/inquiricoes/contribuicoes/${user.username}`);
        contribuicoes = contribResp.data.total;
      }
      catch (_) {
        contribuicoes = 0;
      }
    }

    const sucesso = req.session.perfilSucesso || null;
    const erro    = req.session.perfilErro    || null;
    delete req.session.perfilSucesso;
    delete req.session.perfilErro;

    req.session.save(() => {
      res.render('perfil', { title: 'O Meu Perfil', date, user, contribuicoes, sucesso, erro });
    });

  }
  catch (err) {
    next(err);
  }
})

router.post('/perfil', async (req, res, next) => {
  if (!req.session.utilizador) return res.redirect('/login');
  try {
    await axios.patch(`${AUTH_URL}/auth/perfil`, { bio: req.body.bio }, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    req.session.perfilSucesso = 'Biografia atualizada com sucesso!';
    req.session.perfilErro = null;
  }
  catch (err) {
    req.session.perfilSucesso = null;
    req.session.perfilErro = err.response?.data?.erro || `Erro ao guardar a biografia (${err.message})`;
  }
  req.session.save(() => res.redirect('/perfil'));
});

// ------------------------------------------------- Autenticação ------------------------------------------------- //

router.get('/login', (req, res) => {
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('auth/login', { title: 'Login', date, erro: null });
});

router.post('/login', async (req, res) => {
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  try {
    const r = await axios.post(`${AUTH_URL}/auth/login`, req.body);
    req.session.token = r.data.token;

    // Buscar dados do utilizador
    const perfil = await axios.get(`${AUTH_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${r.data.token}` }
    });
    const u = perfil.data;
    req.session.utilizador = {
      id: String(u._id),
      username: u.username,
      email: u.email,
      nivel: u.nivel,
      filiacao: u.filiacao
    }
    res.redirect('/');
  }
  catch (err) {
    res.render('auth/login', {
      title: 'Login', date,
      erro: err.response?.data?.erro || 'Erro ao fazer login'
    });
  }
});

router.get('/registo', (req, res) => {
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('auth/registo', { title: 'Registo', date, erro: null });
});

router.post('/registo', async (req, res) => {
  const date = new Date().toLocaleString('pt-PT', { hour12: false });
  try {
    await axios.post(`${AUTH_URL}/auth/registo`, req.body);
    res.redirect('/login');
  }
  catch (err) {
    res.render('auth/registo', {
      title: 'Registo', date,
      erro: err.response?.data?.erro || 'Erro ao registar'
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;