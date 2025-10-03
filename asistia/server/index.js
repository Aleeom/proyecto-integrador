const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// Configura transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'infasistia@gmail.com',
    pass: 'mzvy amfh nbwc senn', // contraseña de app
  },
});

// Configuración conexión SQL Server
const config = {
  user: 'sa',
  password: 'TestSqlServer',
  server: 'ANGELCG260',
  port: 1433,
  database: 'EscuelaXBD',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

async function connectToDb() {
  try {
    console.log('Configuración de conexión SQL:', config);
    pool = await sql.connect(config);
    console.log('Conectado a SQL Server');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  }
}
connectToDb();

app.post('/llegada', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'Base de datos no conectada' });

  const { alumnoId } = req.body;

  console.log('Datos recibidos en /llegada:', { alumnoId });

  try {
    const result = await pool.request()
  .input('alumnoId', sql.Int, alumnoId)
  .query(`
    SELECT l.status, a.name, a.papaEmail
    FROM Llegadas l
    JOIN Alumnos a ON a.id = l.alumnoId
    WHERE l.alumnoId = @alumnoId
    ORDER BY l.HoraLlegada DESC
  `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const alumno = result.recordset[0];

    const horaLlegada = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Tomamos el status directamente de la base de datos
    const statusUpper = String(alumno.status || '').trim().toUpperCase();
    console.log('Estado procesado para switch:', statusUpper);

    let mensajeTexto = '';

    switch (statusUpper) {
      case 'PRESENT':
        mensajeTexto = `Hola, su hijo ${alumno.name} llegó a la escuela a las ${horaLlegada}.`;
        break;
      case 'LATE':
        mensajeTexto = `Hola, su hijo ${alumno.name} llegó tarde a la escuela a las ${horaLlegada}.`;
        break;
      case 'ABSENT':
        mensajeTexto = `Hola, su hijo ${alumno.name} faltó a clases el día de hoy.`;
        break;
      default:
        console.log('Status no reconocido, enviando mensaje default');
        mensajeTexto = `Hola, hay una actualización sobre la asistencia de su hijo ${alumno.name}.`;
    }

    console.log('Mensaje que se enviará:', mensajeTexto);

    const mailOptions = {
      from: '"InfaSistia" <infasistia@gmail.com>',
      to: alumno.papaEmail,
      subject: `Notificación: estado de asistencia de ${alumno.name}`,
      text: mensajeTexto,
    };

    await transporter.sendMail(mailOptions);
    res.json({ mensaje: 'Estado de asistencia registrado y email enviado.' });
  } catch (error) {
    console.error('Error en /llegada:', error);
    res.status(500).json({ error: 'Error al registrar llegada o enviar email' });
  }
});

// Registrar salida
app.post('/salida', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DB no conectada' });

  let { alumnoId } = req.body;
  if (!alumnoId) return res.status(400).json({ error: 'Debe enviar alumnoId' });

  try {
    // Obtener datos del alumno
    const result = await pool.request()
      .input('alumnoId', sql.Int, alumnoId)
      .query('SELECT id, name, papaEmail FROM Alumnos WHERE id=@alumnoId');

    if (!result.recordset.length) return res.status(404).json({ error: 'Alumno no encontrado' });

    const alumno = result.recordset[0];
    const horaSalida = new Date();

    // Preparar mensaje
    const mensajeTexto = `Hola, su hijo ${alumno.name} salió de la escuela a las ${horaSalida.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })}.`;

    // Enviar correo
    await transporter.sendMail({
      from: '"InfaSistia" <infasistia@gmail.com>',
      to: alumno.papaEmail,
      subject: `Notificación: salida de ${alumno.name}`,
      text: mensajeTexto,
    });

    res.json({ mensaje: 'Correo de salida enviado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar correo de salida' });
  }
});

// Ruta para dashboard con datos reales de la BD
app.get('/dashboard', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'Base de datos no conectada' });

  try {
    const totalAlumnosResult = await pool.request().query('SELECT COUNT(*) AS total FROM Alumnos');
    const totalAlumnos = totalAlumnosResult.recordset[0].total;

    const asistenciasHoyResult = await pool.request()
      .query('SELECT COUNT(*) AS presentes FROM Llegadas WHERE CAST(HoraLlegada AS DATE) = CAST(GETDATE() AS DATE)');
    const asistenciasHoy = asistenciasHoyResult.recordset[0].presentes;

    const faltasHoy = totalAlumnos - asistenciasHoy;

    // Valores de ejemplo para llegadas tarde y alertas, ajusta luego con consultas reales
    const llegadasTarde = 3;
    const alertasRecientes = 2;

    res.json({
      totalAlumnos,
      asistenciasHoy,
      faltasHoy,
      llegadasTarde,
      alertasRecientes,
    });
  } catch (error) {
    console.error('Error en /dashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
});

// Obtener lista de alumnos con estado de asistencia hoy
app.get('/api/attendance/today', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DB no conectada' });

  try {
    const result = await pool.request().query(`
      SELECT a.id, a.name, l.status
      FROM Alumnos a
      LEFT JOIN Llegadas l 
        ON a.id = l.alumnoId
      ORDER BY a.name
    `);

    const students = result.recordset.map(r => ({
      id: r.id,
      name: r.name,
      status: r.status || "", // 👈 mostrará tal cual lo que hay en Llegadas.status
    }));

    res.json(students);
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});

// Guardar o actualizar asistencia
app.post('/api/attendance/saveManual', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DB no conectada' });

  const students = req.body;

  try {
    for (const s of students) {
      // Actualiza solo si ya existe el registro en Asistencias
      const result = await pool.request()
        .input('alumnoId', sql.Int, s.id)
        .input('status', sql.NVarChar(10), s.status)
        .query(`
          UPDATE Asistencias
          SET status = @status, HoraRegistro = GETDATE()
          WHERE alumnoId = @alumnoId AND CAST(HoraRegistro AS DATE) = CAST(GETDATE() AS DATE);
        `);

      // Opcional: si quieres avisar si no existía registro
      if (result.rowsAffected[0] === 0) {
        console.log(`No se encontró registro de asistencia para el alumno ${s.id} el día de hoy`);
      }
    }

    res.json({ mensaje: 'Asistencia actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
