const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    res.render('index')
});

app.post('/salas', async (req, res) => {
    const { nome, localizacao } = req.body;
    const capacidade = parseInt(req.body.capacidade);

    try {
        const sala = await prisma.salas.create({
            data: { nome, localizacao, capacidade },
        });
        res.status(201).json(sala);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar a sala', details: error.message });
    }
});

app.get('/salas', async (req, res) => {
    try {
        const salas = await prisma.salas.findMany({ include: { turmas: true } });
        res.json(salas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar as salas', details: error.message });
    }
});

app.post('/turmas', async (req, res) => {
    const { nome, horario, turno, salaId } = req.body;
    try {
        const turma = await prisma.turmas.create({
            data: { nome, horario, turno, salaId: Number(salaId) },
        });
        res.status(201).json(turma);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar a turma', details: error.message });
    }
});

app.get('/turmas', async (req, res) => {
    try {
        const turmas = await prisma.turmas.findMany({ include: { sala: true } });
        res.json(turmas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar as turmas', details: error.message });
    }
});

app.post('/reservas', async (req, res) => {
    const { data, horarioComeco, horarioFim, sala } = req.body;

    try {
        const reserva = await prisma.reservas.create({ data: { data: (new Date(data)).toISOString(), horarioComeco, horarioFim, salaId: Number(sala) } });
        res.json(reserva);

    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar a reserva', details: error.message });
    }
});

app.post('/ocupacao', async (req, res) => {
    const { turno } = req.body;

    try {
        const ocupacoes = await prisma.turmas.findMany({
            where: {
                turno // Exemplo: "matutino", "vespertino", "noturno"
            },
        });
        res.json(ocupacoes);

    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ocupações', details: error.message });
    }
});

app.post('/chamado', async (req, res) => {
    const { descricao, setor } = req.body;

    try {
        const chamado = await prisma.chamados.create({ data: { descricao, setor } });

        res.json(chamado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar seu chamado', details: error.message });
    };
});

app.get('/chamados', async (req, res) => {
    try {
        const chamados = await prisma.chamados.findMany();
        res.json(chamados);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao procurar chamados', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
