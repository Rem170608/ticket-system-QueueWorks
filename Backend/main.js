const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));

app.use(express.json());
console.log('Backend gestartet...');

// JWT Secret Key (CHANGE THIS IN PRODUCTION!)
const JWT_SECRET = 'queueworks-secret-key-change-in-production-2025';

const pool = mysql.createPool({
    host: "localhost",
    user: "noserq_user",
    password: "password123456",
    database: "ticket-queueworks"
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ============ AUTHENTICATION ENDPOINTS ============

// Login endpoint
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username und Passwort erforderlich' });
    }
    
    // Query admin users table
    const sql = "SELECT * FROM admin_users WHERE username = ?";
    pool.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server Fehler' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Ungültiger Username oder Passwort' });
        }
        
        const user = results[0];
        
        // Compare password with hashed password
        try {
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Ungültiger Username oder Passwort' });
            }
            
            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '8h' }
            );
            
            res.json({ 
                token, 
                message: 'Login erfolgreich',
                username: user.username 
            });
        } catch (bcryptErr) {
            console.error('Bcrypt error:', bcryptErr);
            return res.status(500).json({ message: 'Authentifizierungsfehler' });
        }
    });
});

// Verify token endpoint
app.post('/auth/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ============ TICKET ENDPOINTS ============

// Endpoint to submit a ticket (public - no auth required)
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
        res.json({ message: 'Ticket created successfully', id: result.insertId });
    });
});

// Endpoint to get all tickets (public for live view)
app.get('/tickets', (req, res) => {
    const ljFilter = req.query.LJ; // Filter by Lehrjahr if provided
    
    let sql = 'SELECT * FROM ticket ORDER BY id DESC';
    let params = [];
    
    if (ljFilter) {
        sql = 'SELECT * FROM ticket WHERE LJ = ? ORDER BY id DESC';
        params = [ljFilter];
    }
    
    pool.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Delete single ticket (admin only)
app.delete('/tickets/:id', verifyToken, (req, res) => {
    const ticketId = req.params.id;
    
    const sql = "DELETE FROM ticket WHERE id = ?";
    pool.query(sql, [ticketId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.json({ message: 'Ticket deleted successfully' });
    });
});

// Delete all tickets (admin only)
app.delete('/tickets', verifyToken, (req, res) => {
    const sql = "DELETE FROM ticket";
    pool.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'All tickets deleted', count: result.affectedRows });
    });
});

// ============ SETUP ENDPOINT (for initial admin user creation) ============

// Endpoint to create admin user - USE ONCE then comment out!
app.post('/setup/create-admin', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = "INSERT INTO admin_users (username, password) VALUES (?, ?)";
        pool.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Admin user created successfully', id: result.insertId });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST /auth/login - Login');
    console.log('  POST /auth/verify - Verify token');
    console.log('  POST /submit-ticket - Submit ticket');
    console.log('  GET /tickets - Get tickets');
    console.log('  DELETE /tickets/:id - Delete ticket (auth required)');
    console.log('  DELETE /tickets - Delete all tickets (auth required)');
    console.log('  POST /setup/create-admin - Create admin user (setup only)');
});