// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../config/db'); // Utiliser l'interface db.query

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_LIFETIME = process.env.JWT_LIFETIME || '1d';

module.exports = {
    register: async (req, res) => {
        try {
            // Vérification de la connexion à la BDD via l'interface db
            if (!db || !db.query) { 
                console.error("[Register] Échec d'obtention de l'interface BDD.");
                return res.status(503).json({ message: "Service de base de données indisponible" });
            }

            const { email, password, username } = req.body;
            if (!email || !password || !username) {
                return res.status(400).json({ message: "Tous les champs sont requis" });
            }

            // Vérification de l'existence de l'utilisateur
            const userCheck = await db.query('SELECT id FROM "users" WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).json({ message: "Email déjà utilisé" });
            }

            // Hachage et Insertion
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query(
                'INSERT INTO "users" (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
                [email, hashedPassword, username]
            );

            const newUser = result.rows[0];
            res.status(201).json({ message: "Utilisateur créé", user: newUser });

        } catch (error) {
            console.error("❌ ERREUR FATALE (register):", error.stack);
            res.status(500).json({ message: "Erreur serveur interne lors de l'inscription" });
        }
    },

    login: async (req, res) => {
        try {
            // Vérification de la connexion à la BDD
            if (!db || !db.query) return res.status(503).json({ message: "Service de base de données indisponible" });

            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "L'email et le mot de passe sont requis" });
            }

            // Récupérer l'utilisateur (on utilise db.query)
            const result = await db.query(
                'SELECT id, username, email, password_hash, is_admin FROM "users" WHERE email = $1',
                [email]
            );

            const user = result.rows[0];
            if (!user) { // Utilisateur non trouvé
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) { // Mot de passe invalide
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            // Mettre à jour la date de dernière connexion
            await db.query(
                'UPDATE "users" SET last_login = NOW() WHERE id = $1',
                [user.id]
            );

            // Création du Token JWT AVEC le statut is_admin
            const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                isAdmin: user.is_admin 
            }, 
            JWT_SECRET, 
            { expiresIn: JWT_LIFETIME }
            );

            // Définition du cookie
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