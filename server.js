const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.NODE_ENV === "production" ? "https://itflex.onrender.com" : `http://localhost:${PORT}`;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Middleware de sesión
app.use(session({ secret: "claveSecreta", resave: false, saveUninitialized: true }));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Estrategia de GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/github/callback`
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Middleware para proteger rutas
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

// Ruta principal (Página de presentación)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "presentacion.html"));
});

// Ruta protegida para index
app.get("/index", ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Pagina", "index.html"));
});

// Ruta dinámica para todas las páginas
app.get("/:page", (req, res) => {
    const page = req.params.page;
    
    let filePath = path.join(__dirname, "public", `${page}.html`);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, "public", "Pagina", `${page}.html`);
    }

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send("Página no encontrada");
    }
});

// Ruta para obtener los datos del usuario autenticado
app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "No autenticado" });
    }
    res.json({ name: req.user.displayName });
});

// Ruta para cerrar sesión
app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session.destroy(() => {
            res.redirect("/");
        });
    });
});


// Autenticación con Google
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }), 
    (req, res) => res.redirect("/index")
);

// Autenticación con GitHub
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback", 
    passport.authenticate("github", { failureRedirect: "/" }), 
    (req, res) => res.redirect("/index")
);

// Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor en ${BASE_URL}`);
});
