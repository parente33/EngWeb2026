const Inquiricao = require('../models/inquiricao');

const inquiricaoController = {

    // Listar todos com filtros opcionais - com paginação
    listarTodasInquiricoes: async function (req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 20;
            const skip = (pagina - 1) * limite;

            const filtro = {};

            // Índice antroponímico -- nome
            if (req.query.requerente)
                filtro.requerente = { $regex: req.query.requerente, $options: 'i' };
            if (req.query.pai)
                filtro.pai = { $regex: req.query.pai, $options: 'i' };
            if (req.query.mae)
                filtro.mae = { $regex: req.query.mae, $options: 'i' };

            // Índice toponímico -- lugar
            if (req.query.freguesia)
                filtro.freguesia = { $regex: req.query.freguesia, $options: 'i' };
            if (req.query.concelho)
                filtro.concelho = { $regex: req.query.concelho, $options: 'i' };
            if (req.query.distrito)
                filtro.distrito = { $regex: req.query.distrito, $options: 'i' };

            // Índice cronológico -- ano
            if (req.query.ano)
                filtro.data_inicial = { $regex: `^${req.query.ano}` };

            // Pesquisa de texto livre
            if (req.query.texto)
                filtro.$text = { $search: req.query.texto };

            const [dados, total] = await Promise.all([
                Inquiricao.find(filtro).skip(skip).limit(limite).sort({ data_inicial: 1 }),
                Inquiricao.countDocuments(filtro)
            ]);

            res.json({ total, pagina, limite, dados });
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

    obterInquiricao: async function (req, res) {
        try {
            const doc = await Inquiricao.findOne({ proc_numero: req.params.proc_numero });
            if (!doc) return res.status(404).json({ erro: 'Registo não encontrado...' });
            res.json(doc);
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

    criarInquiricao: async function (req, res) {
        try {
            const dados = { ...req.body, criador: req.utilizador?.username || req.body.criador };
            const doc = new Inquiricao(dados);
            const resultado = await doc.save();
            res.status(201).json(resultado);
        }
        catch (err) {
            res.status(400).json({ erro: err.message });
        }
    },

    atualizarInquiricao: async function (req, res) {
        try {
            const doc = await Inquiricao.findOneAndUpdate(
                { proc_numero: req.params.proc_numero },
                req.body,
                { new: true }
            );
            if (!doc) return res.status(404).json({ erro: 'Registo não encontrado...' });
            res.json(doc);
        }
        catch (err) {
            res.status(400).json({ erro: err.message });
        }
    },

    apagarInquiricao: async function (req, res) {
        try {
            const doc = await Inquiricao.findOneAndDelete({ proc_numero: req.params.proc_numero });
            if (!doc) return res.status(404).json({ erro: 'Registo não encontrado...' });
            res.status(204).send();
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

   // GET /inquiricoes/indice/nomes -- Lista de requerentes ordenados por ordem alfabética
    indiceNomes: async function (req, res) {
        try {
            const nomes = await Inquiricao.aggregate([
                { $match: { requerente: { $exists: true, $ne: null } } },
                { $group: { _id: '$requerente' } },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, nome: '$_id' } }
            ]);
            res.json(nomes.map(n => n.nome));
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

   // GET /inquiricoes/indice/lugares -- Lista de concelhos/distritos únicos
    indiceLugares: async function (req, res) {
        try {
            const [concelhos, distritos] = await Promise.all([
                Inquiricao.aggregate([
                    { $match: { concelho: { $exists: true, $ne: null } } },
                    { $group: { _id: '$concelho' } },
                    { $sort: { _id: 1 } },
                    { $project: { _id: 0, lugar: '$_id' } }
                ]),
                Inquiricao.aggregate([
                    { $match: { distrito: { $exists: true, $ne: null } } },
                    { $group: { _id: '$distrito' } },
                    { $sort: { _id: 1 } },
                    { $project: { _id: 0, lugar: '$_id' } }
                ])
            ]);

            res.json({
                concelhos: concelhos.map(c => c.lugar),
                distritos: distritos.map(d => d.lugar)
            });
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

   // GET /inquiricoes/indice/datas -- Lista de anos que têm registos (e quantos são)
    indiceDatas: async function (req, res) {
        try {
            const anos = await Inquiricao.aggregate([
                { $match: { data_inicial: { $exists: true, $ne: null } } },
                { $project: { ano: { $substr: ['$data_inicial', 0, 4] } } },
                { $group: { _id: '$ano', total: { $sum: 1 } } },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, ano: '$_id', total: 1 } }
            ]);
            res.json(anos);
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

    contarContribuicoes: async function (req, res) {
        try {
            const total = await Inquiricao.countDocuments({ criador: req.params.username });
            res.json({ username: req.params.username, total });
        }
        catch (err) {
            res.status(500).json({ erro: err.message });
        }
    }
}

module.exports = inquiricaoController