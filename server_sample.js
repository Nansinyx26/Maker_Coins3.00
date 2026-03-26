const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
    .catch(err => console.error('❌ Erro de conexão:', err));

// Esquema do Aluno
const UserSchema = new mongoose.Schema({
    nome: String,
    email: { type: String, unique: true },
    senha: { type: String, required: true },
    turma: String,
    saldo: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);

// Esquema de Transações
const TransactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    valor: Number,
    descricao: String,
    data: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// ROTA: Registro de Aluno
app.post('/api/register', async (req, res) => {
    try {
        const { nome, email, senha, turma } = req.body;
        const hashedSenha = await bcrypt.hash(senha, 10);

        const newUser = new User({ nome, email, senha: hashedSenha, turma });
        await newUser.save();

        res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao cadastrar: e-mail já existe.' });
    }
});

// ROTA: Login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(senha, user.senha)) {
        const token = jwt.sign({ id: user._id, turma: user.turma }, 'SECRET_KEY_MAKER');
        res.json({ token, nome: user.nome, turma: user.turma, saldo: user.saldo });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});

// ROTA: Obter Extrato (Histórico)
app.get('/api/history', async (req, res) => {
    const token = req.headers.authorization;
    // Lógica de verificação de token omitida para brevidade
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(transactions);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor Maker rodando na porta ${PORT}`));
