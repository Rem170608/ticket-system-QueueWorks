import { alert } from 'node:console';


// MySQL database connection details

const password = "password123456";
const host = "localhost";
const user = "noserq_user";
const database = "ticket-queueworks";





let {createPool} = require('mysql');

let pool = createPool({
  host: host,
  user: user,
  password: password,
  database: database
});

pool.query('SELECT * FROM ticket', (err, res) => {
  if (err) throw err;
  return console.log(res);
});



// Function to submit a ticket

function submitTicket() {
    alert('Ticket wird eingereicht...');
    pool.query('SELECT * FROM ticket', (err, res) => {
    if (err) throw err;
    return console.log(res);
    });
    alert('Datenbankverbindung hergestellt...');
    const name = document.getElementById('nameInput').value;
    const cat = document.getElementById('category').value;
    const LJ = document.getElementById('lehrjahr').value;
    const msg = document.getElementById('descriptionInput').value;
    if (!name || !cat || !LJ || !msg) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    } else {
        const sql = "INSERT INTO ticket (name, cat, LJ, msg) VALUES (name, cat, LJ, msg)";
        con.query(sql, [name, cat, LJ, msg], (err, result) => {
            if (err) throw err;
            alert('Ticket erfolgreich eingereicht!');
            window.location.href = '/index.html';
        });
    }
};