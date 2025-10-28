// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getPool } = require('../config/db'); 

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_LIFETIME = process.env.JWT_LIFETIME || '1d';

module.exports = {
    register: async (req, res) => {
        console.log("--- Début du processus d'inscription ---");
        try {
            // Vérification de la connexion à la BDD
            const pool = await getPool();
            if (!pool) {
                console.error("[Register] Échec d'obtention du pool de connexion. Vérifiez db.js et les CONNECTIONSTRINGs.");
                return res.status(503).json({ message: "Service de base de données indisponible" });
            }
            console.log("[Register] 1. Pool de connexion obtenu.");

            const { email, password, username } = req.body;
            console.log(`[Register] Données reçues: Email=${email}, Username=${username}, Password=${password ? 'OUI' : 'NON'}`);

            if (!email || !password || !username) {
                console.warn("[Register] Données manquantes (400)");
                return res.status(400).json({ message: "Tous les champs sont requis" });
            }

            // 2. Vérification de l'existence de l'utilisateur
            console.log(`[Register] 2. Vérification si l'email ${email} existe déjà.`);
            const userCheck = await pool.query('SELECT id FROM "users" WHERE email = $1', [email]);

            if (userCheck.rows.length > 0) {
                console.warn(`[Register] Email ${email} déjà utilisé (400)`);
                return res.status(400).json({ message: "Email déjà utilisé" });
            }

            // 3. Hachage du mot de passe
            console.log("[Register] 3. Début du hachage Bcrypt.");
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("[Register] 3. Hachage terminé.");

            // 4. Insertion dans la BDD
            console.log("[Register] 4. Début de l'insertion dans la BDD.");
            const result = await pool.query(
                'INSERT INTO "users" (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
                [email, hashedPassword, username]
            );
            console.log("[Register] 4. Insertion BDD réussie.");

            const newUser = result.rows[0];
            console.log(`[Register] ✅ Utilisateur créé : ID ${newUser.id}`);
            res.status(201).json({ message: "Utilisateur créé", user: newUser });

        } catch (error) {
            // C'est ici que tous les problèmes non-400/non-503 devraient être capturés.
            console.error("❌ ERREUR FATALE (register) capturée:", error.message);
            console.error("Détails de l'erreur (stack) :", error.stack);
            res.status(500).json({ message: "Erreur serveur interne lors de l'inscription" });
        }
        console.log("--- Fin du processus d'inscription ---");
    },

    login: async (req, res) => {
        try {
            const pool = await getPool();
            if (!pool) return res.status(503).json({ message: "Service de base de données indisponible" });

            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "L'email et le mot de passe sont requis" });
            }

            // Récupérer l'utilisateur AVEC le statut is_admin
            const result = await pool.query(
                'SELECT id, username, email, password_hash, is_admin FROM "users" WHERE email = $1',
                [email]
            );

            const user = result.rows[0];
            if (!user) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            // 1. Mettre à jour la date de dernière connexion (cette ligne ne plantera plus après le fix SQL)
            await pool.query(
                'UPDATE "users" SET last_login = NOW() WHERE id = $1',
                [user.id]
            );

            // 2. Création du Token JWT AVEC le statut is_admin
            const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                isAdmin: user.is_admin // AJOUT ESSENTIEL
            }, 
            JWT_SECRET, 
            { expiresIn: JWT_LIFETIME }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 // 24 heures
            });

            // Supprimer le hash avant de renvoyer l'objet utilisateur au client
            const { password_hash, ...userPayload } = user; 

            res.status(200).json({ 
                message: "Connexion réussie", 
                user: userPayload // L'objet userPayload contient maintenant is_admin pour la redirection côté client
            });

        } catch (error) {
            console.error("Erreur login:", error);
            // Si vous avez corrigé le SQL, cette erreur ne devrait plus apparaître.
            res.status(500).json({ message: "Erreur serveur" });
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
            const pool = await getPool();
            if (!pool) return res.status(503).json({ message: "Service de base de données indisponible" });

            const userId = req.user.userId;
            const result = await pool.query(
            "SELECT id, email, username, created_at FROM users WHERE id = $1",
            [userId]
            );
            res.status(200).json({ success: true, user: result.rows[0] });
        } catch (err) {
            console.error("Erreur lors de la récupération du profil :", err);
            res.status(500).json({ success: false, message: "Erreur serveur" });
        }
      }

};