const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();
const pool = require("./src/config/db");
const path = require("path");



const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? 'https://pruebasitflex.onrender.com/auth/google/callback'
  : 'http://localhost:5000/auth/google/callback';


console.log('Usando GOOGLE_CALLBACK_URL:', googleCallbackURL);
let FRONTEND_URL = '';  // define fuera para usar luego

if (googleCallbackURL === "https://pruebasitflex.onrender.com/auth/google/callback") {
  FRONTEND_URL = 'https://pruebasitflex.onrender.com';
} else if (googleCallbackURL === "http://localhost:5000/auth/google/callback") {
  FRONTEND_URL = 'http://localhost:3000';
} else if (googleCallbackURL === "https://itflex.onrender.com/auth/google/callback") {
  FRONTEND_URL = 'https://itflex.onrender.com';
} else {
  FRONTEND_URL = 'http://localhost:3000'; // fallback por si no coincide nada
}

console.log('Usando FRONTEND_URL:', FRONTEND_URL);
const app = express();

// Middleware
const allowedOrigins = [
  'https://pruebasitflex.onrender.com',
  'http://localhost:3000',
  'https://itflex.onrender.com'
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
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
  callbackURL: googleCallbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Paso 1: Insertar o actualizar usuario principal
    const usuarioResult = await pool.query(
      `INSERT INTO autenticacion.usuarios (name, email, google_id, avatar_url, provider, role, last_login)
       VALUES ($1, $2, $3, $4, 'google', 'usuario', NOW())
       ON CONFLICT (email)
       DO UPDATE SET google_id = EXCLUDED.google_id,
                     avatar_url = EXCLUDED.avatar_url,
                     provider = EXCLUDED.provider,
                     last_login = NOW()
       RETURNING id`,
      [
        profile.displayName,
        profile.emails[0].value,
        profile.id,
        profile.photos[0].value
      ]
    );

    const userId = usuarioResult.rows[0].id;

    // Paso 2: Insertar perfil solo si no existe para ese user_id
    await pool.query(
      `INSERT INTO usuarios.perfiles (user_id, bio, location, website, hourly_rate, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        userId,
        `Hola, soy ${profile.displayName}`, // bio
        '',                                  // location
        '',                                  // website
        0.00,                                // hourly_rate
        profile.photos[0].value              // profile_image
      ]
    );

    done(null, { id: userId }); // para serializar
  } catch (err) {
    console.error('Error en estrategia Google:', err);
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
    console.log('Redirigiendo a:', `${FRONTEND_URL}/Home`);
    res.redirect(`${FRONTEND_URL}/Home`);
  }
);

// Rutas API
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,   
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
    const clientId = req.user.id;

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
  const freelancerId = req.user?.id;

  try {
    // Traer todos los proyectos con info del cliente
    const proyectosResult = await pool.query(`
      SELECT p.*, u.name AS nombre_cliente
      FROM proyectos.proyectos p
      JOIN autenticacion.usuarios u ON p.client_id = u.id
      ORDER BY p.created_at DESC
    `);

    let idsPostulados = [];

    if (freelancerId) {
      // Buscar proyectos en los que el freelancer ya se postuló
      const postulacionesResult = await pool.query(
        `SELECT project_id FROM proyectos.propuestas WHERE freelancer_id = $1`,
        [freelancerId]
      );
      idsPostulados = postulacionesResult.rows.map(r => r.project_id);
    }

    // Agregar el campo ya_postulado
    const proyectosConPostulacion = proyectosResult.rows.map(proyecto => ({
      ...proyecto,
      ya_postulado: idsPostulados.includes(proyecto.id),
    }));

    res.json(proyectosConPostulacion);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
});

app.get('/api/postulaciones/usuario/:freelancerId', async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;
    const result = await pool.query(
      'SELECT project_id FROM proyectos.propuestas WHERE freelancer_id = $1',
      [freelancerId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener postulaciones del usuario' });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Consulta sencilla para probar conexión
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error('Error en test-db:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta para obtener el perfil del usuario autenticado
app.get("/api/perfil", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const usuarioId = req.user.id;

    const perfilResult = await pool.query(`
      SELECT 
        u.name AS nombre,
        u.email,
        p.bio,
        p.location,
        p.website,
        p.hourly_rate,
        p.profile_image
      FROM usuarios.perfiles p
      JOIN autenticacion.usuarios u ON p.user_id = u.id
      WHERE u.id = $1
    `, [usuarioId]);

    if (perfilResult.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    const perfil = perfilResult.rows[0];

    const enlacesResult = await pool.query(`
      SELECT platform, url 
      FROM usuarios.enlaces_sociales
      WHERE user_id = $1
    `, [usuarioId]);
    const enlaces = enlacesResult.rows;

    const portafoliosResult = await pool.query(`
      SELECT title, description, url, created_at
      FROM usuarios.portafolios
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [usuarioId]);
    const portafolios = portafoliosResult.rows;

    const habilidadesResult = await pool.query(`
      SELECT ch.id, ch.name
      FROM usuarios.user_habilidades uh
      JOIN compartido.habilidades ch ON uh.skill_id = ch.id
      WHERE uh.user_id = $1
    `, [usuarioId]);
const habilidades = habilidadesResult.rows;

    res.json({
      perfil,
      enlaces_sociales: enlaces,
      portafolios,
      habilidades,
    });
  } catch (error) {
    console.error("Error al obtener perfil completo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.get("/api/habilidades", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM compartido.habilidades ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo habilidades:", error);
    res.status(500).json({ error: "Error obteniendo habilidades" });
  }
});

/*Ruta para subir los cambios del perfil*/
app.put("/api/perfil", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "No autorizado" });
    }
    const userId = req.user.id;
    const {
  bio,
  location,
  website,
  hourly_rate,
  profile_image,
  enlaces_sociales,
  habilidades
} = req.body;
  
    // Actualizar datos generales del perfil
    await pool.query(`
      INSERT INTO usuarios.perfiles (user_id, bio, location, website, hourly_rate, profile_image)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET bio = $2, location = $3, website = $4, hourly_rate = $5, profile_image = $6
    `, [userId, bio, location, website, hourly_rate, profile_image]);

    // Insertar habilidades sin duplicar
    if (Array.isArray(habilidades)) {
      for (const skillId of habilidades) {
        await pool.query(`
          INSERT INTO usuarios.user_habilidades (user_id, skill_id)
          SELECT $1, $2
          WHERE NOT EXISTS (
            SELECT 1 FROM usuarios.user_habilidades
            WHERE user_id = $1 AND skill_id = $2
          )
        `, [userId, skillId]);
      }
    }

    // Insertar nuevos enlaces sociales sin borrar anteriores
    if (Array.isArray(enlaces_sociales)) {
      for (const enlace of enlaces_sociales) {
        await pool.query(`
          INSERT INTO usuarios.enlaces_sociales (user_id, platform, url)
          SELECT $1, $2, $3
          WHERE NOT EXISTS (
            SELECT 1 FROM usuarios.enlaces_sociales
            WHERE user_id = $1 AND platform = $4 AND url = $5
          )
        `, [userId, enlace.platform, enlace.url, enlace.platform, enlace.url]);
      }
    }

    res.json({ message: "Perfil actualizado correctamente" });

  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "Error actualizando perfil" });
  }
});

// Ruta para obtener perfiles de otros usuarios
app.get("/api/perfil/:id", async (req, res) => {
  const usuarioId = req.params.id;

  try {
    const perfilResult = await pool.query(`
      SELECT 
        u.name AS nombre,
        u.email,
        p.bio,
        p.location,
        p.website,
        p.hourly_rate,
        p.profile_image
      FROM usuarios.perfiles p
      JOIN autenticacion.usuarios u ON p.user_id = u.id
      WHERE u.id = $1
    `, [usuarioId]);

    if (perfilResult.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const perfil = perfilResult.rows[0];

    const enlacesResult = await pool.query(`
      SELECT platform, url 
      FROM usuarios.enlaces_sociales
      WHERE user_id = $1
    `, [usuarioId]);

    const portafoliosResult = await pool.query(`
      SELECT title, description, url, created_at
      FROM usuarios.portafolios
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [usuarioId]);

    const habilidadesResult = await pool.query(`
      SELECT ch.id, ch.name
      FROM usuarios.user_habilidades uh
      JOIN compartido.habilidades ch ON uh.skill_id = ch.id
      WHERE uh.user_id = $1
    `, [usuarioId]);

    res.json({
      perfil,
      enlaces_sociales: enlacesResult.rows,
      portafolios: portafoliosResult.rows,
      habilidades: habilidadesResult.rows,
    });
  } catch (error) {
    console.error("Error al obtener perfil por ID:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});
//Ruta para obtener invitaciones
app.get('/api/invitaciones/recibidas', async (req, res) => {
  try {
    const freelancerId = req.user?.id;
    if (!freelancerId) return res.status(401).json({ error: 'No autenticado' });

    const result = await pool.query(`
     SELECT 
      i.id,
      i.freelancer_id,
      i.project_id,
      i.sent_at AS created_at,
      u.name AS emisor_name,
      p.client_id AS emisor_id,
      json_build_object(
        'id', p.id,
        'title', p.title,
        'description', p.description,
        'budget', p.budget,
        'deadline', p.deadline,
        'created_at', p.created_at
      ) AS project
    FROM proyectos.invitaciones i
    JOIN proyectos.proyectos p ON i.project_id = p.id
    JOIN autenticacion.usuarios u ON p.client_id = u.id
    WHERE i.freelancer_id = $1
    ORDER BY i.sent_at DESC

    `, [freelancerId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener invitaciones recibidas' });
  }
});

//Ruta para proyectos para invitaciones
app.get('/api/invitaciones/proyectos-invitables/:freelancer_id', async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const freelancer_id = req.params.freelancer_id;

    // Obtener proyectos del cliente donde el freelancer no ha sido invitado ni postulado
    const { rows: proyectos } = await pool.query(
      `
      SELECT p.*
      FROM proyectos.proyectos p
      WHERE p.client_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM proyectos.invitaciones i
          WHERE i.project_id = p.id AND i.freelancer_id = $2
        )
        AND NOT EXISTS (
          SELECT 1 FROM proyectos.propuestas pr
          WHERE pr.project_id = p.id AND pr.freelancer_id = $2
        )
      `,
      [clientId, freelancer_id]
    );

    res.json(proyectos);

  } catch (error) {
    console.error('Error al obtener proyectos invitables:', error);
    res.status(500).json({ error: 'Error al obtener proyectos invitables' });
  }
});

//Ruta para enviar invitaciones
app.post('/api/invitaciones', async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { project_id, freelancer_id } = req.body;

    if (!project_id || !freelancer_id) {
      return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    // Verificar si ya existe la invitación
    const { rowCount: invitacionExiste } = await pool.query(
      `SELECT 1 FROM proyectos.invitaciones 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [project_id, freelancer_id]
    );

    if (invitacionExiste > 0) {
      return res.status(409).json({ error: "Ya se ha enviado una invitación a este freelancer para este proyecto" });
    }

    // Verificar si el freelancer ya se postuló al proyecto
    const { rowCount: postulacionExiste } = await pool.query(
      `SELECT 1 FROM proyectos.propuestas
       WHERE project_id = $1 AND freelancer_id = $2`,
      [project_id, freelancer_id]
    );

    if (postulacionExiste > 0) {
      return res.status(409).json({ error: "El freelancer ya se postuló a este proyecto" });
    }

    // Insertar invitación
    const { rows } = await pool.query(
      `INSERT INTO proyectos.invitaciones (project_id, freelancer_id) 
       VALUES ($1, $2) RETURNING *`,
      [project_id, freelancer_id]
    );

    res.status(201).json({ mensaje: 'Invitación enviada', invitacion: rows[0] });
  } catch (error) {
    console.error('Error al enviar invitación:', error);
    res.status(500).json({ error: 'Error al enviar la invitación' });
  }
});


// Ruta protegida: obtener proyectos del usuario autenticado
app.get("/api/mis-proyectos", (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "No autenticado" });

  pool.query("SELECT * FROM proyectos.proyectos WHERE client_id = $1", [userId])
    .then((result) => res.json(result.rows))
    .catch((err) => {
      console.error("Error al obtener proyectos del usuario:", err);
      res.status(500).json({ error: "Error del servidor" });
    });
});

app.post('/api/postulaciones', async (req, res) => {
  const { project_id, freelancer_id, proposal_text, proposed_budget, estimated_days } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO proyectos.propuestas 
       (project_id, freelancer_id, proposal_text, proposed_budget, estimated_days) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [project_id, freelancer_id, proposal_text, proposed_budget, estimated_days]
    );

    res.status(201).json({ mensaje: 'Postulación registrada', postulación: resultado.rows[0] });
  } catch (error) {
    console.error('Error al registrar la postulación:', error.message);
    res.status(500).json({ error: 'Error al registrar la postulación' });
  }
});

app.get('/api/postulaciones/proyecto/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const resultado = await pool.query(`
      SELECT 
        p.id,
        p.proposal_text,
        p.proposed_budget,
        p.estimated_days,
        p.created_at,
        u.id AS freelancer_id,
        u.name AS freelancer_name,
        u.email AS freelancer_email,
        u.avatar_url,
        COALESCE(
          json_agg(
            DISTINCT h.name
          ) FILTER (WHERE h.name IS NOT NULL),
          '[]'
        ) AS habilidades
      FROM proyectos.propuestas p
      JOIN autenticacion.usuarios u ON p.freelancer_id = u.id
      LEFT JOIN usuarios.user_habilidades uh ON u.id = uh.user_id
      LEFT JOIN compartido.habilidades h ON uh.skill_id = h.id
      WHERE p.project_id = $1
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
    `, [projectId]);

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({ error: 'Error al obtener postulaciones' });
  }
});

// Producción: servir React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
