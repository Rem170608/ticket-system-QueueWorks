// Function to submit a ticket
async function submitTicket() {
    const name = document.getElementById('nameInput').value;
    const cat = document.getElementById('category').value;
    const LJ = document.getElementById('lehrjahr').value;
    const msg = document.getElementById('descriptionInput').value;

    if (!name || !cat || !LJ || !msg) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/submit-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, cat, LJ, msg })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        alert('Ticket erfolgreich eingereicht!');
        window.location.href = '/Frontend/index.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Fehler beim Einreichen des Tickets');
    }
}

// Make submitTicket available globally
window.submitTicket = submitTicket;