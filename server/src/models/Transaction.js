const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    valor: { type: Number, required: true },
    descricao: { type: String, required: true },
    data: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
