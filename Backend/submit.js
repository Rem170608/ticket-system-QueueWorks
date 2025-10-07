// submit.js
import con from './main.js';  // Ensure the path is correct

const submitButton = document.getElementById('submitBtn');

submitButton.addEventListener('click', (event) => {
    event.preventDefault();  // Prevent default form submission

    const name = document.getElementById('name').value;
    const cat = document.getElementById('category').value;
    const LJ = document.getElementById('lehrjahr').value;
    const msg = document.getElementById('text').value;

    if (!name || !cat || !LJ || !msg) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    } else {
        const sql = "INSERT INTO ticket (name, cat, LJ, msg) VALUES (?, ?, ?, ?)";
        con.query(sql, [name, cat, LJ, msg], (err, result) => {
            if (err) throw err;
            alert('Ticket erfolgreich eingereicht!');
            window.location.href = '/index.html';
        });
    }
});
