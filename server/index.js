require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from parent directory (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..')));

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', apiRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Conectado ao MongoDB Atlas');

        // Ensure Admin User Exists
        const User = require('./src/models/User');
        const bcrypt = require('bcryptjs');

        const adminEmail = 'admin@makercoins.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const hashedSenha = await bcrypt.hash('Maker@Admin2026', 10);
            const admin = new User({
                nome: 'Administrador Master',
                email: adminEmail,
                senha: hashedSenha,
                turma: 'ADMIN',
                role: 'admin'
            });
            await admin.save();
            console.log('👷 Conta Admin criada com sucesso!');
        }
    })
    .catch(err => {
        console.error('❌ Erro de conexão com MongoDB:', err.message);
        process.exit(1);
    });

// Health check
app.get('/', (req, res) => {
    res.send('Maker Coins API is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Maker rodando na porta ${PORT}`);
});
