// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 
const db = require('../config/db');

exports.authenticate = async (req, res, next) => {
    const token = req.cookies.token; 

    if (!token) {
        //console.warn("[Auth] Tentative d'accès sans token (401)");
        return next(); 
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Récupération des données utilisateur complètes (is_admin)
        const result = await db.query(
            `SELECT id, username, is_admin FROM users WHERE id = $1`,
            [decoded.userId] // Utilisation de userId pour la recherche BDD
        );

        if (result.rows.length === 0) {
            res.clearCookie('token'); 
            req.user = null; // Utilisateur inconnu
            return next();
        }
        
        // Stockage des données utilisateur
        req.user = result.rows[0]; 
        //console.log(`[Auth] Utilisateur authentifié: ${req.user.username} (ID: ${req.user.id}, Admin: ${req.user.is_admin})`);
        next();

    } catch (err) {
        // Le token est expiré ou invalide
        console.error("❌ ERREUR JWT:", err.message);
        res.clearCookie('token'); 
        req.user = null;
        next(); // Le token invalide est nettoyé, on continue pour laisser checkTokenAndRedirect agir
    }
};

exports.checkTokenAndRedirect = (req, res, next) => {
    const publicPaths = ['/login', '/signup', '/auth/login', '/auth/register'];
    const staticPrefixes = ['/css/', '/js/', '/assets/', '/favicon.ico', '/.well-known/'];
    const isStaticAsset = staticPrefixes.some(prefix => req.path.startsWith(prefix));
    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    if (req.user && req.user.id) {
        if (req.path.startsWith('/login') || req.path.startsWith('/signup')) {
             return res.redirect('/');
        }
        return next();
    }
    if (isPublicPath || isStaticAsset) { 
        return next();
    }
    if (req.path === '/') {
        console.warn(`[AuthGuard] Accès à la racine sans token. Redirection vers /login.`);
        return res.redirect('/login');
    }
    console.warn(`[AuthGuard] Accès refusé à ${req.path}. Redirection vers /login.`);
    res.redirect('/login');
};