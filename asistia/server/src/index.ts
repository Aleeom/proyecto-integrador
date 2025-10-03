import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// List students example
app.get('/api/students', async (req, res) => {
  try {
    const db = await pool;
    const result = await db.request().query('SELECT Id, Name, RfId, GroupId FROM Student');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Device event (from gateway)
app.post('/api/device/event', async (req, res) => {
  try {
    const { uid, timestamp, latitude, longitude } = req.body;
    const db = await pool;
    // Find device
    const dev = await db.request()
      .input('uid', uid)
      .query('SELECT Id, StudentId FROM Device WHERE Uid = @uid');
    if (!dev.recordset.length) return res.status(404).json({ error: 'device not linked' });
    const device = dev.recordset[0];
    const recTime = timestamp ? new Date(timestamp) : new Date();

    await db.request()
      .input('studentId', device.StudentId)
      .input('groupId', null)
      .input('status', 'PRESENT')
      .input('recordedAt', recTime)
      .input('source', 'device')
      .input('lat', latitude || null)
      .input('lng', longitude || null)
      .query(`INSERT INTO Attendance (StudentId, GroupId, Status, RecordedAt, Source, Latitude, Longitude)
              VALUES (@studentId, @groupId, @status, @recordedAt, @source, @lat, @lng)`);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server running on port', port));
