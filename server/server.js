const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
require("dotenv").config();
const pool = require("./src/config/db");
const path = require("path");
const crypto = require("crypto")


const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? 'https://pruebasitflex.onrender.com/auth/google/callback'
  : 'http://localhost:5000/auth/google/callback';

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
    // Traer todos los proyectos con info del cliente + calificación promedio del cliente
    const proyectosResult = await pool.query(`
      SELECT 
        p.*, 
        u.name AS nombre_cliente,
        COALESCE(ROUND((
          SELECT AVG(r.rating)::numeric
          FROM reseñas.reseñas r
          WHERE r.reviewed_id = p.client_id
        ), 1)::float, 0) AS calificacion_promedio
      FROM proyectos.proyectos p
      JOIN autenticacion.usuarios u ON p.client_id = u.id
      ORDER BY p.created_at DESC
    `);

    let idsPostulados = [];

    if (freelancerId) {
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
      i.status,
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

// Ruta para aceptar invitación (actualiza status a 'aceptada')
app.post('/api/invitaciones/aceptar/:id', async (req, res) => {
  const invitacionId = req.params.id;

  try {
    // Actualiza el estado a 'aceptada'
    const result = await pool.query(
      `UPDATE proyectos.invitaciones SET status = 'Aceptada' WHERE id = $1 RETURNING *`,
      [invitacionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    res.json({ mensaje: "Invitación aceptada", invitacion: result.rows[0] });
  } catch (error) {
    console.error('Error aceptando invitación:', error);
    res.status(500).json({ error: 'Error del servidor al aceptar invitación' });
  }
});


// Ruta para rechazar invitación (elimina de la base)
app.post('/api/invitaciones/rechazar/:id', async (req, res) => {
  const invitacionId = req.params.id;

  try {
    // Elimina la invitación
    const result = await pool.query(
      `DELETE FROM proyectos.invitaciones WHERE id = $1 RETURNING *`,
      [invitacionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    res.json({ mensaje: "Invitación rechazada y eliminada" });
  } catch (error) {
    console.error('Error rechazando invitación:', error);
    res.status(500).json({ error: 'Error del servidor al rechazar invitación' });
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

// Ruta protegida: obtener proyectos donde usuario fue aceptado freelancer
app.get("/api/mis-trabajos", async (req, res) => {
  try {
    const freelancerId = req.user?.id;
    if (!freelancerId) return res.status(401).json({ error: "No autenticado" });

    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.budget,
        p.status,
        p.created_at,
        u.id AS cliente_id,
        u.name AS cliente_name
      FROM proyectos.propuestas po
      JOIN proyectos.proyectos p ON po.project_id = p.id
      JOIN autenticacion.usuarios u ON p.client_id = u.id
      WHERE po.freelancer_id = $1 AND po.status = 'Aceptada'
      ORDER BY p.created_at DESC;
    `;

    const result = await pool.query(query, [freelancerId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener trabajos aceptados:", error);
    res.status(500).json({ error: "Error al obtener trabajos" });
  }
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
        p.status,
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

// Ruta para aceptar propuesta (actualiza el status de la propuesta y el proyecto, y rechaza las demás)
app.put('/api/postulaciones/:postulacionId/aceptar', async (req, res) => {
  const { postulacionId } = req.params;

  try {
    // 1. Obtener el project_id de la propuesta que se está aceptando
    const propuesta = await pool.query(`
      SELECT project_id FROM proyectos.propuestas WHERE id = $1;
    `, [postulacionId]);

    if (propuesta.rowCount === 0) {
      return res.status(404).json({ error: "Propuesta no encontrada" });
    }

    const projectId = propuesta.rows[0].project_id;

    // 2. Aceptar la propuesta actual
    const aceptar = await pool.query(`
      UPDATE proyectos.propuestas
      SET status = 'Aceptada'
      WHERE id = $1
      RETURNING *;
    `, [postulacionId]);

    // 3. Rechazar todas las demás propuestas del mismo proyecto
    await pool.query(`
      UPDATE proyectos.propuestas
      SET status = 'Rechazada'
      WHERE project_id = $1 AND id != $2;
    `, [projectId, postulacionId]);

    // 4. Actualizar el estado del proyecto
    await pool.query(`
      UPDATE proyectos.proyectos
      SET status = 'En desarrollo'
      WHERE id = $1;
    `, [projectId]);

    res.json({ mensaje: "Propuesta aceptada y proyecto actualizado", propuesta: aceptar.rows[0] });
  } catch (error) {
    console.error("Error al aceptar propuesta:", error);
    res.status(500).json({ error: "Error al aceptar propuesta" });
  }
});


// Ruta para rechazar propuesta (elimina la propuesta)
app.delete('/api/postulaciones/:postulacionId/rechazar', async (req, res) => {
  const { postulacionId } = req.params;

  try {
    const resultado = await pool.query(`
      DELETE FROM proyectos.propuestas
      WHERE id = $1
      RETURNING *;
    `, [postulacionId]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: "Propuesta no encontrada" });
    }

    res.json({ mensaje: "Propuesta rechazada y eliminada" });
  } catch (error) {
    console.error("Error al rechazar propuesta:", error);
    res.status(500).json({ error: "Error al rechazar propuesta" });
  }
});

app.put('/api/proyectos/:id/finalizar', async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;

  try {
    const result = await pool.query(`
      SELECT 
        p.client_id, 
        p.budget, 
        pr.freelancer_id
      FROM proyectos.proyectos p
      JOIN proyectos.propuestas pr ON pr.project_id = p.id
      WHERE p.id = $1 AND pr.status = 'Aceptada'
      LIMIT 1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró el proyecto o no hay freelancer aceptado.' });
    }

    const { client_id, budget, freelancer_id } = result.rows[0];
    const amount = monto ? parseFloat(monto) : budget;

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    await pool.query('BEGIN');

    await pool.query(`
      INSERT INTO transacciones.billeteras (user_id, balance)
      VALUES ($1, 0.00)
      ON CONFLICT (user_id) DO NOTHING
    `, [client_id]);

    await pool.query(`
      INSERT INTO transacciones.billeteras (user_id, balance)
      VALUES ($1, 0.00)
      ON CONFLICT (user_id) DO NOTHING
    `, [freelancer_id]);

    await pool.query(`
      INSERT INTO transacciones.pagos (sender_id, receiver_id, amount, project_id)
      VALUES ($1, $2, $3, $4)
    `, [client_id, freelancer_id, amount, id]);

    await pool.query(`
      UPDATE transacciones.billeteras
      SET balance = balance - $1
      WHERE user_id = $2
    `, [amount, client_id]);

    await pool.query(`
      UPDATE transacciones.billeteras
      SET balance = balance + $1
      WHERE user_id = $2
    `, [amount, freelancer_id]);

    await pool.query(`
      UPDATE proyectos.proyectos
      SET status = 'Finalizado'
      WHERE id = $1
    `, [id]);

    await pool.query('COMMIT');

    res.status(200).json({ message: 'Pago realizado y proyecto finalizado con éxito' });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error al finalizar y pagar:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
});


app.post('/api/chats/existing', async (req, res) => {
  const { freelancer_id, cliente_id } = req.body;

  if (!freelancer_id || !cliente_id) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM mensajes.chat WHERE freelancer_id = $1 AND cliente_id = $2',
      [freelancer_id, cliente_id]
    );

    if (result.rows.length > 0) {
      res.json({ exists: true, chat: result.rows[0] });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error en consulta /api/chats/existing:', error);
    res.status(500).json({ error: 'Error en la consulta de chats' });
  }
});

app.get('/api/chats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
        c.chat_id,
        u.id AS interlocutor_id,
        u.name AS interlocutor_nombre,
        u.avatar_url,
        c.cliente_id,
        c.freelancer_id,
        COUNT(m.mensaje_id) FILTER (
          WHERE m.sender_id != $1 AND m.seen = FALSE
        ) AS no_vistos
      FROM mensajes.chat c
      JOIN autenticacion.usuarios u ON (
        (c.cliente_id = $1 AND u.id = c.freelancer_id)
        OR
        (c.freelancer_id = $1 AND u.id = c.cliente_id)
      )
      LEFT JOIN mensajes.mensaje m ON m.chat_id = c.chat_id
      WHERE $1 IN (c.cliente_id, c.freelancer_id)
      GROUP BY c.chat_id, u.id, u.name, u.avatar_url, c.cliente_id, c.freelancer_id
      ORDER BY MAX(m.timestamp) DESC;
    `;

    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error cargando chats:', error);
    res.status(500).json({ error: 'Error al cargar chats' });
  }
});

app.get('/api/buscar', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Falta parámetro de búsqueda' });

  try {
    const resultados = await pool.query(`
      SELECT 
        'proyecto' AS tipo,
        id AS id,
        title AS nombre,
        description AS extra_info,
        NULL AS habilidades
      FROM proyectos.proyectos
      WHERE LOWER(title) LIKE LOWER($1)

      UNION

      SELECT
        'usuario' AS tipo,
        u.id AS id,
        u.name AS nombre,
        u.email AS extra_info,
        COALESCE(STRING_AGG(h.name, ', '), '') AS habilidades
      FROM autenticacion.usuarios u
      LEFT JOIN usuarios.user_habilidades uh ON uh.user_id = u.id
      LEFT JOIN compartido.habilidades h ON uh.skill_id = h.id
      WHERE LOWER(u.name) LIKE LOWER($1) OR LOWER(h.name) LIKE LOWER($1)
      GROUP BY u.id, u.name, u.email

      ORDER BY nombre;
    `, [`%${query}%`]);

    res.json(resultados.rows);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

// Ruta para crear un nuevo chat
app.post('/api/chats', async (req, res) => {
  const { freelancer_id, cliente_id } = req.body;

  if (!freelancer_id || !cliente_id) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const insertResult = await pool.query(
      'INSERT INTO mensajes.chat (freelancer_id, cliente_id) VALUES ($1, $2) RETURNING chat_id',
      [freelancer_id, cliente_id]
    );
    res.status(201).json({ chat_id: insertResult.rows[0].chat_id });
  } catch (error) {
    console.error('Error creando chat:', error);
    res.status(500).json({ error: 'Error creando chat' });
  }
});

// Ruta para obtener mensajes de un chat específico
app.get('/api/chats/:userId/mensajes/:chatId', async (req, res) => {
  const { userId, chatId } = req.params;

  try {
    const query = `
      SELECT 
        m.mensaje_id, 
        m.sender_id, 
        m.text, 
        m.timestamp, 
        m.seen,
        u.name AS sender_name
      FROM mensajes.mensaje m
      JOIN autenticacion.usuarios u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.timestamp ASC
    `;

    const { rows } = await pool.query(query, [chatId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//Ruta para marcar mensajes como vistos
app.post('/api/chats/:userId/marcar-vistos/:chatId', async (req, res) => {
  const { userId, chatId } = req.params;

  try {
    // Solo marcamos como vistos los mensajes que fueron ENVIADOS por otro usuario (no por el mismo usuario)
    const updateQuery = `
      UPDATE mensajes.mensaje
      SET seen = TRUE
      WHERE chat_id = $1 AND sender_id != $2 AND seen = FALSE
    `;

    await pool.query(updateQuery, [chatId, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marcando mensajes como vistos:', error);
    res.status(500).json({ error: 'Error al marcar como vistos' });
  }
});

// Ruta para enviar un mensaje
app.post('/api/chats/:emisor_id/mensajes', async (req, res) => {
  const { emisor_id } = req.params;
  const { chat_id, texto } = req.body;

  if (!chat_id || !texto) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    // Verificar que el chat existe
    const chatResult = await pool.query(
      'SELECT * FROM mensajes.chat WHERE chat_id = $1',
      [chat_id]
    );

    if (chatResult.rowCount === 0) {
      return res.status(400).json({ error: 'Chat no existe' });
    }

    // Insertar el mensaje
    const insertResult = await pool.query(
      'INSERT INTO mensajes.mensaje (chat_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *',
      [chat_id, emisor_id, texto]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

// Rutas para el balance
app.get('/api/balance/usuario/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      'SELECT balance FROM transacciones.billeteras WHERE user_id = $1',
      [userId]
    );

    const balance = result.rows.length > 0 ? result.rows[0].balance : 0;

    res.json({ balance });
  } catch (error) {
    console.error('Error en /api/balance:', error);
    res.status(500).json({ error: 'Error obteniendo balance' });
  }
});


app.post('/api/balance/actualizar', async (req, res) => {
  try {
    const userId = req.user.id;
    const { monto } = req.body;

    if (typeof monto !== 'number' || monto === 0) {
    return res.status(400).json({ error: 'Monto inválido' });
    }

    // Intentar actualizar
    const updateResult = await pool.query(
      'UPDATE transacciones.billeteras SET balance = balance + $1 WHERE user_id = $2 RETURNING balance;',
      [monto, userId]
    );

    let nuevoBalance;

    if (updateResult.rows.length === 0) {
      // Si no existe, insertamos la billetera
      const insertResult = await pool.query(
        'INSERT INTO transacciones.billeteras (user_id, balance) VALUES ($1, $2) RETURNING balance;',
        [userId, monto]
      );
      nuevoBalance = insertResult.rows[0].balance;
    } else {
      nuevoBalance = updateResult.rows[0].balance;
    }

    res.json({ balance: nuevoBalance });
  } catch (error) {
    console.error('Error en /api/balance/actualizar:', error);
    res.status(500).json({ error: 'Error actualizando balance' });
  }
});

app.post('/api/resenas', async (req, res) => {
  const { reviewer_id, reviewed_id, project_id, rating, comment } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO reseñas.reseñas (reviewer_id, reviewed_id, project_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reviewer_id, reviewed_id, project_id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al insertar reseña:', error);
    res.status(500).json({ error: 'Error al insertar reseña' });
  }
});

app.get('/api/proyectos/:id/freelancer', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT freelancer_id FROM proyectos.propuestas WHERE project_id = $1 AND status = $2 LIMIT 1',
      [id, 'Aceptada']  
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró un freelancer asignado' });
    }

    res.json({ freelancer_id: result.rows[0].freelancer_id });
  } catch (error) {
    console.error('Error al obtener el freelancer:', error);
    res.status(500).json({ error: 'Error al obtener el freelancer' });
  }
});

app.get('/api/resenas/usuario/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [reseñasResult, promedioResult] = await Promise.all([
      pool.query(
        `SELECT r.rating, r.comment, r.created_at, u.name AS nombre_reviewer, r.project_id
         FROM reseñas.reseñas r
         JOIN autenticacion.usuarios u ON r.reviewer_id = u.id
         WHERE r.reviewed_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS promedio
         FROM reseñas.reseñas r
         WHERE r.reviewed_id = $1`,
        [userId]
      ),
    ]);

    res.json({
      resenas: reseñasResult.rows,
      calificacion_promedio: Number(promedioResult.rows[0].promedio),
    });
  } catch (error) {
    console.error('Error al obtener reseñas por usuario:', error);
    res.status(500).json({ error: 'Error al obtener reseñas por usuario' });
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