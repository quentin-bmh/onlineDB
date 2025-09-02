const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.HOST_BDD,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PWD,
  port: process.env.DATABASE_PORT,
});

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  register: async (req, res) => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      const userCheck = await pool.query('SELECT id FROM "users" WHERE email = $1', [email]);
      if (userCheck.rows.length > 0)
        return res.status(400).json({ message: "Email déjà utilisé" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO "users" (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
        [email, hashedPassword, username]
      );

      const newUser = result.rows[0];
      res.status(201).json({ message: "Utilisateur créé", user: newUser });

    } catch (error) {
      console.error("Erreur register:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Email et mot de passe requis" });

      const result = await pool.query(
        'SELECT id, email, username, password_hash FROM "users" WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0)
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch)
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });

      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 1000
      });
      res.json({
        message: "Connexion réussie",
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });

    } catch (error) {
      console.error("Erreur login:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;  // <-- ici userId au lieu de id
      const result = await pool.query(
        "SELECT id, email, created_at FROM users WHERE id = $1",
        [userId]
      );
      res.status(200).json({ success: true, user: result.rows[0] });
    } catch (err) {
      console.error("Erreur lors de la récupération du profil :", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }

};
