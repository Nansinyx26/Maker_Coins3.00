const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getHistory = async (req, res) => {
    try {
        const history = await Transaction.find({ userId: req.user.id }).sort({ data: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
};

exports.getRanking = async (req, res) => {
    try {
        const { turma } = req.params;
        const ranking = await User.find({ turma })
            .sort({ saldo: -1 })
            .select('nome saldo avatar');
        res.json(ranking);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ranking.' });
    }
};

exports.getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const stats = await User.aggregate([
            { $group: { _id: null, totalCoins: { $sum: "$saldo" } } }
        ]);
        const totalCoins = stats.length > 0 ? stats[0].totalCoins : 0;
        res.json({ totalUsers, totalCoins });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas globais.' });
    }
};

exports.redeemAward = async (req, res) => {
    try {
        const { awardId, cost, name } = req.body;
        const user = await User.findById(req.user.id);

        if (user.saldo < cost) {
            return res.status(400).json({ error: 'Saldo insuficiente.' });
        }

        user.saldo -= cost;
        await user.save();

        const transaction = new Transaction({
            userId: user._id,
            valor: -cost,
            descricao: `Resgate de prêmio: ${name}`
        });
        await transaction.save();

        res.json({ message: 'Prêmio resgatado com sucesso!', novoSaldo: user.saldo });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao resgatar prêmio.' });
    }
};
