const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Middleware de sesión (debe ir antes de passport)
app.use(session({ secret: "claveSecreta", resave: false, saveUninitialized: true }));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Estrategia de GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "presentacion.html"));
});

// Ruta protegida para servir index.html
app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para obtener los datos del usuario autenticado
app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "No autenticado" });
    }
    res.json({ name: req.user.displayName });
});

// Ruta para cerrar sesión
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

// Autenticación con Google
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }), 
    (req, res) => res.redirect("/dashboard")
);

// Autenticación con GitHub
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback", 
    passport.authenticate("github", { failureRedirect: "/" }), 
    (req, res) => res.redirect("/dashboard")
);

// Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

