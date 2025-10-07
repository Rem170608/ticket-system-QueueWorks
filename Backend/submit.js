import mysql from 'mysql';
import connect from "./main.js";

// Function to handle form submission

connect;
const submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click', function() {
    const name = document.getElementById('name').character;
    const cat = document.getElementById('category').character;
    const LJ = document.getElementById('lehrjahr').character;
    const msg = document.getElementById('text').character;
    if (!name || !cat || !LJ || !text) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    }
    else {
        let sql = "INSERT INTO ticket (name, cat, LJ, msg) VALUES ('" + name + "', '" + cat + "', '" + LJ + "', '" + msg + "')";
    }
});
