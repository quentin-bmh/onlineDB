// middleware/authMilleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

exports.authenticate = (req, res, next) => {
    const token = req.cookies.token; 

    if (!token) {
        console.warn("[Auth] Tentative d'accès sans token (401)");
        return res.status(401).json({ message: "Accès refusé. Authentification requise." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        
        next();

    } catch (err) {
        console.error("❌ ERREUR JWT:", err.message);
        res.clearCookie('token'); 
        return res.status(401).json({ message: "Token invalide ou expiré. Veuillez vous reconnecter." });
    }
};

