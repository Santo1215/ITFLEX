const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public"))); // Sirve archivos estáticos desde "public"
app.use(express.static('public'));

const PORT = process.env.PORT || 3000; // Render asigna un puerto automáticamente


// Ruta para servir el HTML principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "presentacion.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

// Configurar la sesión
app.use(session({ secret: "claveSecreta", resave: false, saveUninitialized: true }));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de Google OAuth
passport.use(new GoogleStrategy({
    clientID: "89911314827-edb0bngc1tcej98tjbl2qdrusfb8778a.apps.googleusercontent.com",
    clientSecret: "TUGOCSPX-nGOik_9RGtTMUouZgVZB1AcxVjwj",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Ruta para iniciar autenticación con Google
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Ruta de callback después de la autenticación
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirige a la página deseada después de login
  }
);

app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});


