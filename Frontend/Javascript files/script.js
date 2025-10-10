// Function to show notification
function showNotification(message, isError = false) {
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    
    if (isError) {
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.remove('d-none');
            if (successMsg) successMsg.classList.add('d-none');
        }
    } else {
        if (successMsg) {
            successMsg.textContent = message;
            successMsg.classList.remove('d-none');
            if (errorMsg) errorMsg.classList.add('d-none');
            
            // Auto-hide success messages after 3 seconds
            setTimeout(() => {
                successMsg.classList.add('d-none');
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
    const submitBtn = document.getElementById('submitBtn');

    // Validate inputs
    if (!name || !cat || !LJ || !msg) {
        showNotification('Bitte füllen Sie alle Felder aus.', true);
        return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Wird eingereicht...';

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
        
        // Clear form
        document.getElementById('nameInput').value = '';
        document.getElementById('category').value = '';
        document.getElementById('lehrjahr').value = '';
        document.getElementById('descriptionInput').value = '';
        
        // Redirect after showing the success message
        setTimeout(() => {
            window.location.href = '/Frontend/Html files/index.html';
        }, 750);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Fehler beim Einreichen des Tickets. Bitte versuchen Sie es erneut.', true);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
    }
}

// Make functions available globally
window.submitTicket = submitTicket;
window.showNotification = showNotification;