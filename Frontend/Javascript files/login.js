const API_URL = 'http://localhost:3000';
const AUTH_KEY = 'queueworks_admin_session';

async function checkAdminNotexisting() {
    try {
        const response = await fetch(`${API_URL}/auth/check-admin`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error('Invalid content type:', contentType);
            throw new Error("Server sent non-JSON response");
        }

        const data = await response.json();
        console.log('Server response data:', data);
        
        if (!data.adminExists) {
            setTimeout(() => {
                console.log('Admin does not exist, redirecting to setup page');
                window.location.href = '/Frontend/Html files/admin-setup.html';
                sessionStorage.setItem('setupMessage', 'Admin existiert nicht. Weiterleitung...');
            }, 2000);
            return;
        }   

        console.log('Admin exists');
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.classList.add('d-none');
        }
        
    } catch (error) {
        console.error('Setup check error:', error);
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            if (error.message.includes('Failed to fetch')) {
                errorMessage.textContent = 'Server nicht erreichbar. Bitte stellen Sie sicher, dass der Server läuft und auf Port 3000 erreichbar ist.';
            } else {
                errorMessage.textContent = `Fehler beim Überprüfen des Admin-Status: ${error.message}`;
            }
            errorMessage.classList.remove('d-none');
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    checkAdminNotexisting();
    
    // Check for setup messages
    const setupMessage = sessionStorage.getItem('setupMessage');
    if (setupMessage) {
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.textContent = setupMessage;
            errorMsg.classList.remove('d-none');
            sessionStorage.removeItem('setupMessage');
        }
    }

    // Setup password toggle
    const passwordInput = document.getElementById('passwordInput');
    const showPasswordBtn = document.getElementById('showPasswordBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (showPasswordBtn && passwordInput && eyeIcon) {
        showPasswordBtn.addEventListener('mousedown', () => {
            passwordInput.type = 'text';
            eyeIcon.src = '/Media/icons8-eye-50.png';
        });
        
        showPasswordBtn.addEventListener('mouseup', () => {
            passwordInput.type = 'password';
            eyeIcon.src = '/Media/icons8-closed-eye-50.png';
        });
        
        showPasswordBtn.addEventListener('mouseleave', () => {
            passwordInput.type = 'password';
            eyeIcon.src = '/Media/icons8-closed-eye-50.png';
        });
    }
    
    // Add Enter key handler
    passwordInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn')?.click();
        }
    });
    
    document.getElementById('usernameInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordInput?.focus();
        }
    });
});

// Login functionality
document.getElementById('loginBtn')?.addEventListener('click', async function() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    // Hide previous messages
    errorMsg?.classList.add('d-none');
    successMsg?.classList.add('d-none');
    
    if(!username && !password) {
        errorMsg.textContent = 'Bitte Benutzername und Passwort eingeben.';
        errorMsg.classList.remove('d-none');
        return;
    }
    
    if (!password) {
        errorMsg.textContent = 'Bitte Passwort eingeben.';
        errorMsg.classList.remove('d-none');
        return;
    }
    
    if (!username) {
        errorMsg.textContent = 'Bitte Benutzername eingeben.';
        errorMsg.classList.remove('d-none');
        return;
    }   
    
    // Disable button during request
    loginBtn.disabled = true;
    const originalHtml = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Logging in...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server hat keine JSON-Antwort zurückgegeben. Läuft der Server?');
        }
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            sessionStorage.setItem(AUTH_KEY, data.token);
            successMsg.textContent = 'Login erfolgreich! Weiterleitung...';
            successMsg.classList.remove('d-none');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 750);
        } else {
            console.error('Login failed:', response.ok, data, response.status);
            errorMsg.textContent = data.message || 'Ungültiger Username oder Passwort.';
            errorMsg.classList.remove('d-none');
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalHtml;
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
        errorMsg.classList.remove('d-none');
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalHtml;
    }
});

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem(AUTH_KEY);
    if (token) {
        fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(resp => {
            if (resp.ok) {
                window.location.href = 'admin.html';
            }
        })
        .catch(err => {
            sessionStorage.removeItem(AUTH_KEY);
        });
    }
});