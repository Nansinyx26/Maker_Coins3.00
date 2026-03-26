const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.updateCoins = async (req, res) => {
    try {
        const { email, valor, descricao, secret } = req.body;

        // Simple secret check for demo purposes, in production use middleware
        if (secret !== 'Mantra2222') {
            return res.status(403).json({ error: 'Não autorizado.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        user.saldo += Number(valor);
        await user.save();

        const transaction = new Transaction({
            userId: user._id,
            valor: Number(valor),
            descricao: descricao || (valor >= 0 ? 'Crédito administrativo' : 'Débito administrativo')
        });
        await transaction.save();

        res.json({ message: 'Transação realizada com sucesso!', novoSaldo: user.saldo });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar transação.' });
    }
};

exports.updateCoinsBulk = async (req, res) => {
    try {
        const { turma, valor, action, secret } = req.body;

        if (secret !== 'Mantra2222') {
            return res.status(403).json({ error: 'Não autorizado.' });
        }

        const numericValue = Number(valor);
        const actualValue = action === 'add' ? numericValue : -numericValue;

        // Update all users in the class
        await User.updateMany(
            { turma },
            { $inc: { saldo: actualValue } }
        );

        // Record transactions for each user (optional but good for history)
        const users = await User.find({ turma });
        const transactions = users.map(u => ({
            userId: u._id,
            valor: actualValue,
            descricao: `Ação em grupo (${action}): ${valor} MKR`
        }));
        await Transaction.insertMany(transactions);

        res.json({ message: `Transação em grupo concluída para ${users.length} estudantes.` });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar transação em grupo.' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { email, secret } = req.body;

        if (secret !== 'Mantra2222') {
            return res.status(403).json({ error: 'Não autorizado.' });
        }

        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Delete related transactions
        await Transaction.deleteMany({ userId: user._id });

        res.json({ message: 'Usuário removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover usuário.' });
    }
};

exports.getAllUsersByClass = async (req, res) => {
    try {
        const { turma } = req.params;
        const users = await User.find({ turma }).select('nome email saldo');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const history = await Transaction.find({ userId: user._id }).sort({ data: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
};
