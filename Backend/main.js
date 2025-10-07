import express from 'express'; // Import Express
import mysql from 'mysql2';     // Use mysql2 for ES modules
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL configuration details
const password = "password123456";
const host = "localhost";
const user = "noserq_user";
const database = "ticket-queueworks";

const con = mysql.createConnection({
  host,
  user,
  password,
  database
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// Helpers for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Simple CORS middleware for local dev (adjust for production)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../Frontend')));
// Also expose the Backend folder so client can load /Backend/submit.js
app.use('/Backend', express.static(path.join(__dirname)));

app.get('/health', (req, res) => res.send('OK'));

// Respond to preflight requests for the tickets endpoint
app.options('/api/tickets', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

// API endpoint to accept ticket submissions from the frontend
app.post('/api/tickets', (req, res) => {
  const { name, cat, LJ, msg } = req.body;
  if (!name || !cat || !LJ || !msg) {
    return res.status(400).send('Missing fields');
  }

  const sql = 'INSERT INTO ticket (name, cat, LJ, msg) VALUES (?, ?, ?, ?)';
  con.query(sql, [name, cat, LJ, msg], (err, result) => {
    if (err) {
      console.error('DB error', err);
      return res.status(500).send('Database error');
    }
    res.json({ id: result.insertId });
  });
});

// API endpoint to list tickets for the frontend
app.get('/api/tickets', (req, res) => {
  // Optional: allow filtering by LJ (Lehrjahr) via query string
  const { LJ } = req.query;
  let sql = 'SELECT id, name, cat, LJ, msg, created_at FROM ticket ORDER BY id DESC LIMIT 200';
  const params = [];
  if (LJ) {
    sql = 'SELECT id, name, cat, LJ, msg, created_at FROM ticket WHERE LJ = ? ORDER BY id DESC LIMIT 200';
    params.push(LJ);
  }

  con.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error fetching tickets', err);
      return res.status(500).send('Database error');
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep connection open for reuse; export if other modules need it
export default con;
