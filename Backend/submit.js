import con from "./main.js";

// Function to handle form submission
const submitButton = document.getElementById('submitBtn');

submitButton.addEventListener('click', (event) => {
    event.preventDefault();  // Prevent default form submission

    const name = document.getElementById('name').value;  // Use .value instead of .character
    const cat = document.getElementById('category').value;  // Use .value
    const LJ = document.getElementById('lehrjahr').value;  // Use .value
    const msg = document.getElementById('text').value;  // Use .value

    if (!name || !cat || !LJ || !msg) {  // Ensure all fields are filled out
        alert('Bitte alle Felder ausfüllen!');
        return;
    } else {
        // Example of parameterized query
        const sql = "INSERT INTO ticket (name, cat, LJ, msg) VALUES (?, ?, ?, ?)";
        con.query(sql, [name, cat, LJ, msg], function (err, result) {
            if (err) throw err;
            alert('Ticket erfolgreich eingereicht!');
            window.location.href = '/index.html';
        });
    }
});
