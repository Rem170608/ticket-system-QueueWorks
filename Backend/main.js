const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

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

// Check if admin exists
app.get('/auth/check-admin', (req, res) => {
    console.log('Received check-admin request');
    // First, check if table exists
    const checkTableSql = `
        SELECT COUNT(*) as tableExists 
        FROM information_schema.tables 
        WHERE table_schema = 'ticket-queueworks' 
        AND table_name = 'admin_users'`;
    
    pool.query(checkTableSql, (err, tableResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                adminExists: false,
                error: 'Database error' 
            });
        }

        // If table doesn't exist, create it
        if (tableResults[0].tableExists === 0) {
            const createTableSql = `
                CREATE TABLE admin_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;
            
            pool.query(createTableSql, (err) => {
                if (err) {
                    console.error('Table creation error:', err);
                    return res.status(500).json({ 
                        adminExists: false,
                        error: 'Database error' 
                    });
                }
                // No admin exists yet since we just created the table
                return res.json({ 
                    adminExists: false,
                    hasPassword: false
                });
            });
        } else {
            // Table exists, check for admin user
            const checkAdminSql = "SELECT * FROM admin_users WHERE username = 'noserq_user'";
            pool.query(checkAdminSql, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ 
                        adminExists: false,
                        error: 'Database error' 
                    });
                }
                
                const adminExists = results.length > 0;
                res.json({ 
                    adminExists,
                    hasPassword: adminExists && results[0].password !== null && results[0].password !== ''
                });
            });
        }
    });
});

// Login endpoint
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username und Passwort erforderlich' });
    }

    // Only allow noserq_user to login
    if (username !== 'noserq_user') {
        return res.status(401).json({ message: 'Ungültiger Username oder Passwort' });
    }
    
    // Query admin users table
    const sql = "SELECT * FROM admin_users WHERE username = ?";
    pool.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Datenbankfehler. Bitte versuchen Sie es später erneut.' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Admin-Benutzer existiert nicht' });
        }
        
        const user = results[0];
        
        // Direct password comparison since we're not using bcrypt anymore
        if (password !== user.password) {
            return res.status(401).json({ message: 'Ungültiges Passwort' });
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
    });
});

// Verify token endpoint
app.post('/auth/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ============ TICKET ENDPOINTS ============

// Ensure ticket table exists
app.use((req, res, next) => {
    const checkTableSql = `
        SELECT COUNT(*) as tableExists 
        FROM information_schema.tables 
        WHERE table_schema = 'ticket-queueworks' 
        AND table_name = 'ticket'`;
    
    pool.query(checkTableSql, (err, tableResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (tableResults[0].tableExists === 0) {
            const createTableSql = `
                CREATE TABLE ticket (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    cat VARCHAR(255) NOT NULL,
                    LJ VARCHAR(50) NOT NULL,
                    msg TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;
            
            pool.query(createTableSql, (err) => {
                if (err) {
                    console.error('Table creation error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                next();
            });
        } else {
            next();
        }
    });
});

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

// Endpoint to create admin user (first-time setup only)
app.post('/setup/create-admin', (req, res) => {
    const { password } = req.body;
    const username = 'noserq_user';  // Hardcoded username
    
    if (!password) {
        return res.status(400).json({ error: 'Passwort erforderlich' });
    }

    // Check if table exists first
    const checkTableSql = `
        SELECT COUNT(*) as tableExists 
        FROM information_schema.tables 
        WHERE table_schema = 'ticket-queueworks' 
        AND table_name = 'admin_users'`;
    
    pool.query(checkTableSql, (err, tableResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Datenbankfehler' });
        }

        // If table doesn't exist, create it
        if (tableResults[0].tableExists === 0) {
            const createTableSql = `
                CREATE TABLE admin_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;
            
            pool.query(createTableSql, (createErr) => {
                if (createErr) {
                    console.error('Table creation error:', createErr);
                    return res.status(500).json({ error: 'Fehler beim Erstellen der Datenbanktabelle' });
                }
                // Table created, now create admin user
                createAdminUser();
            });
        } else {
            // Table exists, proceed with admin user creation/check
            createAdminUser();
        }
    });

    function createAdminUser() {
        // Check if admin already exists
        pool.query("SELECT * FROM admin_users WHERE username = ?", [username], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Datenbankfehler' });
            }
            
            if (results.length > 0) {
                if (!results[0].password) {
                    // Update existing admin with password
                    const updateSql = "UPDATE admin_users SET password = ? WHERE username = ?";
                    pool.query(updateSql, [password, username], (updateErr) => {
                        if (updateErr) {
                            console.error(updateErr);
                            return res.status(500).json({ error: 'Fehler beim Aktualisieren des Passworts' });
                        }
                        res.json({ message: 'Admin-Passwort erfolgreich gesetzt', username });
                    });
                } else {
                    return res.status(400).json({ error: 'Admin-Benutzer existiert bereits' });
                }
            } else {
                // Create new admin user
                const insertSql = "INSERT INTO admin_users (username, password) VALUES (?, ?)";
                pool.query(insertSql, [username, password], (insertErr) => {
                    if (insertErr) {
                        console.error(insertErr);
                        return res.status(500).json({ error: 'Fehler beim Erstellen des Admin-Benutzers' });
                    }
                    res.json({ message: 'Admin-Benutzer erfolgreich erstellt', username });
                });
            }
        });
    }
});

// End of setup endpoint
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