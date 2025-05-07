const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();
const pool = require("./src/config/db");

const app = express();

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { rows } = await pool.query(
            `INSERT INTO autenticacion.usuarios (
                name, email, google_id, avatar_url, provider, role, last_login
                ) VALUES ($1, $2, $3, $4, 'google', 'usuario', NOW())
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
                profile.photos[0].value
            ]
        );
        done(null, rows[0]);
    } catch (err) {
        done(err);
    }
}));

// Serialización
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
      res.redirect('http://localhost:3000/home'); // redirige al frontend
    }
);

// Ruta protegida de ejemplo
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.send(`Bienvenido ${req.user.name}`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));


