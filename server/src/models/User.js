const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    turma: { type: String },
    saldo: { type: Number, default: 0 },
    avatar: { type: String },
    idade: { type: Number },
    role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
