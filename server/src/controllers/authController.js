const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, email, senha, turma } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'E-mail já cadastrado.' });
        }

        const hashedSenha = await bcrypt.hash(senha, 10);

        if (!turma) {
            return res.status(400).json({ error: 'Selecione uma turma para registrar.' });
        }

        const user = new User({
            nome,
            email,
            senha: hashedSenha,
            turma: turma,
            saldo: 0,
            role: 'student'
        });

        await user.save();
        res.status(201).json({ message: 'Registro realizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user._id, turma: user.turma, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                turma: user.turma,
                saldo: user.saldo,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao realizar login.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-senha');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        console.log('📝 Profile update request from user:', req.user.id);
        const { nome, idade, avatar } = req.body;
        console.log('Data received:', { nome, idade, avatarLength: avatar?.length });

        const user = await User.findById(req.user.id);

        if (!user) {
            console.log('❌ User not found:', req.user.id);
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (nome) user.nome = nome;
        if (idade !== undefined) user.idade = idade;
        if (avatar) user.avatar = avatar;

        await user.save();
        console.log('✅ Profile updated successfully for:', user.email);

        res.json({
            message: 'Perfil atualizado com sucesso!', user: {
                nome: user.nome,
                idade: user.idade,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.log('❌ Error updating profile:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
};
