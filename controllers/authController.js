// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_LIFETIME = process.env.JWT_LIFETIME || '1d';

module.exports = {
    register: async (req, res) => {
        try {
            if (!db || !db.query) { 
                console.error("[Register] Échec d'obtention de l'interface BDD.");
                return res.status(503).json({ message: "Service de base de données indisponible" });
            }

            const { email, password, username } = req.body;
            if (!email || !password || !username) {
                return res.status(400).json({ message: "Tous les champs sont requis" });
            }

            // Vérification de l'existence de l'utilisateur (déjà inscrit ou en attente)
            const userCheck = await db.query('SELECT id FROM "users" WHERE email = $1 UNION ALL SELECT id FROM "pending_registrations" WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).json({ message: "Email déjà utilisé ou en cours de vérification" });
            }

            // Hachage et Insertion dans la table des demandes en attente
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // NOTE : Vous devez adapter cette requête à la structure réelle de votre table pending_registrations
            const result = await db.query(
                'INSERT INTO "pending_registrations" (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, request_date',
                [email, hashedPassword, username]
            );

            const pendingRequest = result.rows[0];
            // Le statut HTTP doit indiquer une création ou une acceptation
            res.status(202).json({ 
                message: "Demande d'inscription soumise. En attente d'approbation par un administrateur.", 
                request: pendingRequest 
            });

        } catch (error) {
            console.error("❌ ERREUR FATALE (register):", error.stack);
            res.status(500).json({ message: "Erreur serveur interne lors de l'enregistrement de la demande" });
        }
    },

    login: async (req, res) => {
        try {
            if (!db || !db.query) return res.status(503).json({ message: "Service de base de données indisponible" });

            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "L'email et le mot de passe sont requis" });
            }

            let user;
            let passwordHash;
            let isPending = false;
            
            // 1. Recherche dans la table des utilisateurs actifs ("users")
            const activeResult = await db.query(
                'SELECT id, username, email, password_hash, is_admin FROM "users" WHERE email = $1',
                [email]
            );

            if (activeResult.rows.length > 0) {
                user = activeResult.rows[0];
                passwordHash = user.password_hash;
            } else {
                const pendingResult = await db.query(
                    'SELECT id, username, email, password_hash FROM "pending_registrations" WHERE email = $1',
                    [email]
                );
                
                if (pendingResult.rows.length > 0) {     
                    user = pendingResult.rows[0];
                    passwordHash = user.password_hash;
                    isPending = true;
                } else {
                    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
                }
            }
            const isPasswordValid = await bcrypt.compare(password, passwordHash);
            if (!isPasswordValid) { 
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }
            if (isPending) {
                return res.status(403).json({ 
                    message: "Demande en attente d'approbation",
                    code: "PENDING_APPROVAL"
                });
            }
            await db.query(
                'UPDATE "users" SET last_login = NOW() WHERE id = $1',
                [user.id]
            );
            const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                isAdmin: user.is_admin 
            }, 
            JWT_SECRET, 
            { expiresIn: JWT_LIFETIME }
            );
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 ,
                path: '/',
            });

            const { password_hash, ...userPayload } = user; 
            res.status(200).json({ 
                message: "Connexion réussie", 
                user: userPayload 
            });

        } catch (error) {
            console.error("❌ Erreur login:", error.stack);
            res.status(500).json({ message: "Erreur serveur interne" });
        }
    },
    logout: (req, res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/', 
        });
        res.status(200).json({ message: "Déconnexion réussie. Cookie effacé." });
    },
    getProfile: async (req, res) => {
        try {
            if (!req.user || !req.user.id) { 
                return res.status(401).json({ message: "Non authentifié ou données utilisateur non chargées." });
            }
            res.status(200).json({ 
                success: true, 
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    is_admin: req.user.is_admin 
                }
            });

        } catch (err) {
            console.error("Erreur lors de la récupération du profil:", err.stack);
            res.status(500).json({ success: false, message: "Erreur serveur inattendue." });
        }
    }
};