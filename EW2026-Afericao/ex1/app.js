const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

app.use(function(req, res, next){
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)
    next()
})

const nomeBD = "autoRepair"
const mongoHost = process.env.MONGO_URL || `mongodb://127.0.0.1:27017/${nomeBD}`
mongoose.connect(mongoHost)
    .then(() => console.log(`MongoDB: liguei-me à base de dados ${nomeBD}.`))
    .catch(err => console.error('Erro:', err));

// 2. Schema e Model
const repairsSchema = new mongoose.Schema({}, { strict: false, collection: 'repairs', versionKey: false });
const Repair = mongoose.model('Repair', repairsSchema);

// GET /repairs/matriculas — lista de matrículas sem repetições, ordenada alfabeticamente
app.get('/repairs/matriculas', async (req, res) => {
    try {
        const matriculas = await Repair.distinct('viatura.matricula');
        matriculas.sort();
        res.json(matriculas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /repairs/interv — lista de intervenções (código, nome, descrição), sem repetições, ordenada por código
app.get('/repairs/interv', async (req, res) => {
    try {
        const result = await Repair.aggregate([
            { $unwind: '$intervencoes' },
            {
                $group: {
                    _id: '$intervencoes.codigo',
                    nome: { $first: '$intervencoes.nome' },
                    descricao: { $first: '$intervencoes.descricao' }
                }
            },
            { $sort: { '_id': 1 } },
            {
                $project: {
                    _id: 0,
                    codigo: '$_id',
                    nome: 1,
                    descricao: 1
                }
            }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /repairs — todos os registos, com suporte a ?ano=YYYY e ?marca=VRUM
app.get('/repairs', async (req, res) => {
    try {
        let mongoQuery = {};

        if (req.query.ano) {
            const ano = parseInt(req.query.ano);
            mongoQuery.data = {
                $gte: `${ano}-01-01`,
                $lte: `${ano}-12-31`
            };
        }

        if (req.query.marca) {
            mongoQuery['viatura.marca'] = req.query.marca;
        }

        const items = await Repair.find(mongoQuery);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /repairs/:id — registo por id
app.get('/repairs/:id', async (req, res) => {
    try {
        const item = await Repair.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Não encontrado' });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: 'ID inválido ou erro de sistema' });
    }
});

// POST /repairs — inserir novo registo
app.post('/repairs', async (req, res) => {
    try {
        const newItem = new Repair(req.body);
        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /repairs/:id — eliminar registo
app.delete('/repairs/:id', async (req, res) => {
    try {
        const deleted = await Repair.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Não encontrado' });
        res.json({ message: 'Eliminado com sucesso', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(16025, () => console.log('API autoRepair em http://localhost:16025/repairs'));
