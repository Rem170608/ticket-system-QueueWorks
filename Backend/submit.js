// submit.js (client-side)
// This file is served from /Backend/submit.js but runs in the browser.
// It sends a JSON POST to /api/tickets.
const submitButton = document.getElementById('submitBtn');

if (submitButton) {
    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const name = document.getElementById('nameInput').value.trim();
        const cat = document.getElementById('category').value;
        const LJ = document.getElementById('lehrjahr').value;
        const msg = document.getElementById('descriptionInput').value.trim();

        if (!name || !cat || !LJ || !msg) {
            alert('Bitte alle Felder ausfüllen!');
            return;
        }

        try {
            const resp = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cat, LJ, msg })
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || `Server returned ${resp.status}`);
            }

            const data = await resp.json();
            alert('Ticket erfolgreich eingereicht!');
            window.location.href = '/index.html';
        } catch (err) {
            console.error('Submit error', err);
            alert('Fehler beim Einreichen des Tickets. Siehe Konsole für Details.');
        }
    });
} else {
    console.warn('submitBtn not found on page');
}
