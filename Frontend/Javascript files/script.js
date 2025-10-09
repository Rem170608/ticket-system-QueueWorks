// Function to show notification
function showNotification(message, isError = false) {
    const notifyDiv = document.getElementById('notify');
    if (!notifyDiv) {
        // Create notification div if it doesn't exist
        const newNotifyDiv = document.createElement('div');
        newNotifyDiv.id = 'notify';
        newNotifyDiv.style.padding = '10px';
        newNotifyDiv.style.margin = '10px 0';
        newNotifyDiv.style.borderRadius = '5px';
        newNotifyDiv.style.textAlign = 'center';
        
        // Insert after logo
        const logo = document.querySelector('.logo');
        if (logo && logo.parentNode) {
            logo.parentNode.insertBefore(newNotifyDiv, logo.nextSibling);
        }
    }
    
    const notify = document.getElementById('notify');
    if (notify) {
        notify.textContent = message;
        notify.style.display = 'block';
        notify.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
        notify.style.color = isError ? '#ff0000' : '#008000';
        
        // Hide notification after 3 seconds if it's a success message
        if (!isError) {
            setTimeout(() => {
                notify.style.display = 'none';
            }, 3000);
        }
    }
}

// Function to submit a ticket
async function submitTicket() {
    const name = document.getElementById('nameInput').value;
    const cat = document.getElementById('category').value;
    const LJ = document.getElementById('lehrjahr').value;
    const msg = document.getElementById('descriptionInput').value;

    // Validate inputs
    if (!name || !cat || !LJ || !msg) {
        showNotification('Bitte füllen Sie alle Felder aus.', true);
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

        showNotification('Ticket erfolgreich eingereicht! Sie werden weitergeleitet...');
        // Redirect after showing the success message
        setTimeout(() => {
            window.location.href = '/Frontend/Html files/index.html';
        }, 750);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Fehler beim Einreichen des Tickets. Bitte versuchen Sie es erneut.', true);
    }
}


// Make functions available globally
window.submitTicket = submitTicket;
window.showNotification = showNotification;