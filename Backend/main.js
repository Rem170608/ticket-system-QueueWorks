const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

console.log('Backend gestartet...');

const pool = mysql.createPool({
    host: "localhost",
    user: "noserq_user",
    password: "password123456",
    database: "ticket-queueworks"
});

// Endpoint to submit a ticket
app.post('/submit-ticket', (req, res) => {
    const { name, cat, LJ, msg } = req.body;
    
    if (!name || !cat || !LJ || !msg) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = "INSERT INTO ticket (name, cat, LJ, msg) VALUES (?, ?, ?, ?)";
    pool.query(sql, [name, cat, LJ, msg], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Ticket created successfully' });
    });
});

// Endpoint to get all tickets
app.get('/tickets', (req, res) => {
    pool.query('SELECT * FROM ticket', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/tickets', async (req, res) => {
    const {LJ} = req.query;
    const tickets = await db.getTickets(LJ);
    res.json(tickets);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});