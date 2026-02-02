const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('❌ Auth error: No authorization header');
            return res.status(401).json({ error: 'Autenticação necessária' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('❌ Auth error: No token provided');
            return res.status(401).json({ error: 'Autenticação necessária' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('✅ User authenticated:', decoded.id);
        next();
    } catch (error) {
        console.log('❌ Auth error:', error.message);
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
