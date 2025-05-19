const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();
const pool = require("./src/config/db");
const path = require("path");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// Estrategia Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO autenticacion.usuarios (
        name, email, google_id, avatar_url, provider, role, last_login, password
      ) VALUES ($1, $2, $3, $4, 'google', 'usuario', NOW(), $5)
      ON CONFLICT (email) 
      DO UPDATE SET 
        google_id = EXCLUDED.google_id,
        avatar_url = EXCLUDED.avatar_url,
        provider = EXCLUDED.provider,
        last_login = NOW()
      RETURNING *`,
      [
        profile.displayName,
        profile.emails[0].value,
        profile.id,
        profile.photos[0].value,
        null
      ]
    );
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
}));

// Serializar usuario
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const { rows } = await pool.query('SELECT * FROM autenticacion.usuarios WHERE id = $1', [id]);
  done(null, rows[0]);
});

// Rutas de autenticación
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/Home'); // redirige al frontend
  }
);

// Rutas API
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar_url,
    });
  } else {
    res.json({ name: null });
  }
});

app.post("/api/proyectos", async (req, res) => {
  try {
    const { title, description, budget, deadline } = req.body;
    const clientId = req.user?.id || 3;

    const result = await pool.query(
      "INSERT INTO proyectos.proyectos (client_id, title, description, budget, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [clientId, title, description, budget, deadline]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
});

app.get("/api/proyectos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name AS nombre_cliente
      FROM proyectos.proyectos p
      JOIN autenticacion.usuarios u ON p.client_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
});

// Producción: servir React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}
// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
