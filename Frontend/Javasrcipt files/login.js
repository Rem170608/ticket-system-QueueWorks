  
  const AUTH_KEY = 'queueworks_admin_session';
        const API_URL = 'http://localhost:3000';

// Handle password visibility toggle
function showPasswordBtn() {
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eyeIcon');
    
    const isPassword = passwordInput.type === 'password';
    if (isPassword) {
        passwordInput.type = 'text';
        eyeIcon.src = '/Media/icons8-eye-50.png';
        eyeIcon.alt = 'Hide password';
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = '/Media/icons8-closed-eye-50.png';
        eyeIcon.alt = 'Show password';
    }
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('passwordInput');
    
    // Allow Enter key to submit
    passwordInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn')?.click();
        }
    });
    
    document.getElementById('nameInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordInput?.focus();
        }
    });
});

async function login() {
    const name = document.getElementById('nameInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!name || !password) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    }
    else {
        // Simulate authentication (replace with real auth logic)
        if (name === 'admin' && password === 'admin123') {
            // Store session key in localStorage
            localStorage.setItem(AUTH_KEY, 'authenticated');
            alert('Login erfolgreich!');
            window.location.href = 'http://127.0.0.1:5500/Frontend/"Html files"/admin.html';
        } else {
            alert('Ungültiger Benutzername oder Passwort!');
        }
    }
}
