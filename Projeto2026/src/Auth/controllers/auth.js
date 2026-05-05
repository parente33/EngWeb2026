const passport = require('passport');
const jwt      = require('jsonwebtoken');
const path     = require('path');
const fs       = require('fs');
const multer = require('multer');
const User     = require('../models/user');

const JWT_SECRET  = process.env.JWT_SECRET  || 'jwt_segredo_dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

// ------------------------------------------------- Multer ------------------------------------------------- //

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'public', 'uploads', 'perfis');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.utilizador.id}${ext}`);
  },
});
exports.uploadFoto = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }).single('foto');

// ------------------------------------------------- JWT ------------------------------------------------- //

// Gerar token JWT com a informação relevante do utilizador
function gerarToken(user) {
  return jwt.sign(
    {
      id:       user._id,
      username: user.username,
      email:    user.email,
      nivel:    user.nivel
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ------------------------------------------------- Auth ------------------------------------------------- //

/*
  POST /auth/registo
  Cria um novo utilizador
  Body: { username, password, email, filiacao, idade, nivel }
*/
exports.registo = async (req, res) => {
  try {
    const { username, password, email, filiacao, idade, nivel } = req.body;

    if (!username || !password || !email || !filiacao || !idade)
      return res.status(400).json({ erro: 'Campos obrigatórios: username, password, email, filiacao, idade' });

    // passport-local-mongoose trata do hash — usa User.register()
    const user = new User({ username, email, filiacao, idade: Number(idade), nivel: nivel || 'consumidor' });
    const registado = await User.register(user, password);

    const token = gerarToken(registado);
    res.status(201).json({ mensagem: 'Utilizador registado com sucesso', token });
  }
  catch (err) {
    // username duplicado, email duplicado, etc.
    res.status(400).json({ erro: err.message });
  }
};

/*
  POST /auth/login
  Autentica o utilizador e devolve um JWT
  Body: { username, password }
*/
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ erro: info?.message || 'Credenciais inválidas' });

    // Atualiza data do último acesso
    await User.findByIdAndUpdate(user._id, { dataUltimoAcesso: new Date() });

    const token = gerarToken(user);
    res.json({ mensagem: 'Login com sucesso', token });
  })(req, res, next);
};

/*
  POST /auth/logout
  Com JWT stateless o logout é feito no cliente (apagar o token)
  Este endpoint serve apenas para confirmação
*/
exports.logout = (req, res) => {
  res.json({ mensagem: 'Logout efectuado. Apagar o token no cliente.' });
};

/*
  GET /auth/verificar
  Verifica se um token JWT é válido
  Header: Authorization: Bearer <token>
  Usado pela API e pela Interface para validar pedidos
*/
exports.verificar = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ erro: 'Token inválido ou expirado' });
    res.json({ valido: true, utilizador: payload });
  });
};

// ------------------------------------------------- Perfil ------------------------------------------------- //

/*
  GET /auth/perfil
  Devolve os dados do utilizador autenticado
  Header: Authorization: Bearer <token>
*/
exports.perfil = async (req, res) => {
  try {
    // req.utilizador é preenchido pelo middleware verifyToken (routes/auth.js)
    const user = await User.findById(req.utilizador.id).select('-hash -salt');
    if (!user) return res.status(404).json({ erro: 'Utilizador não encontrado' });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

/*
  PATCH /auth/perfil
  Atualiza os campos editáveis do utilizador autenticado (bio e fotoPerfil)
  Header: Authorization: Bearer <token>
*/
exports.atualizarPerfil = async (req, res) => {
  try {
    const camposPermitidos = ['bio', 'fotoPerfil'];
    const atualizacao = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) atualizacao[campo] = req.body[campo];
    }

    const user = await User.findByIdAndUpdate(
      req.utilizador.id,
      atualizacao,
      { new: true }
    ).select('-hash -salt');

    if (!user) return res.status(404).json({ erro: 'Utilizador não encontrado' });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

/*
  POST /auth/perfil/foto
  Faz upload da foto de perfil do utilizador autenticado
  Header: Authorization: Bearer <token>
  Body: multipart/form-data com campo 'foto'
*/
exports.atualizarFoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum ficheiro.' });
    const urlFoto = `/uploads/perfis/${req.file.filename}`;

    // Apagar ficheiros antigos do mesmo utilizador com extensão diferente
    // (evita acumulação de .jpg, .png, .webp, etc. e confusão de cache)
    // tava-se a ter uns problemas com isto, a ver se resolve
    const dir = path.join(__dirname, '..', 'public', 'uploads', 'perfis');
    const idUtilizador = String(req.utilizador.id);
    try {
      const ficheiros = fs.readdirSync(dir);
      for (const f of ficheiros) {
        if (f.startsWith(idUtilizador) && f !== req.file.filename) {
          fs.unlinkSync(path.join(dir, f));
        }
      }
    } catch (_) { /* se falhar não bloqueia o upload */ }

    const user = await User.findByIdAndUpdate(
      req.utilizador.id,
      { fotoPerfil: urlFoto },
      { new: true }
    );
    res.json({ fotoPerfil: user.fotoPerfil });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// ------------------------------------------------- Perfil Público ------------------------------------------------- //

/*
  GET /auth/utilizadores/:username — perfil público de um utilizador
*/
exports.perfilPublico = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-hash -salt -email -dataUltimoAcesso');
    if (!user) return res.status(404).json({ erro: 'Utilizador não encontrado' });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// ------------------------------------------------- Admin ------------------------------------------------- //

/*
  GET /auth/utilizadores — listar todos (só admin)
*/
exports.listarUtilizadores = async (req, res) => {
  try {
    const users = await User.find().select('-hash -salt');
    res.json(users);
  }
  catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

/*
  DELETE /auth/utilizadores/:id — apagar utilizador (só admin)
*/
exports.apagarUtilizador = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ erro: 'Utilizador não encontrado' });
    res.status(204).send();
  }
  catch (err) {
    res.status(500).json({ erro: err.message });
  }
};