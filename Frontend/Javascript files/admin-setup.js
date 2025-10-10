const API_URL = 'http://localhost:3000';

// Check if admin already exists
async function checkAdminExists() {
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
        
        if (data.adminExists) {
            sessionStorage.setItem('setupMessage', 'Admin bereits eingerichtet. Bitte melden Sie sich an.');
            window.location.href = '/Frontend/Html files/login.html';
            return;
        }

        const loginNavLink = document.getElementById('loginNavLink');
        if (loginNavLink) {
            loginNavLink.href = '/Frontend/Html files/admin-setup.html';
        }

        // Show setup form with Bootstrap classes
        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            setupForm.classList.remove('d-none');
        }
        
        // Hide error messages
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

// Initialize password toggles
document.addEventListener('DOMContentLoaded', function () {
    checkAdminExists();

    // Setup password toggles
    const passwordConfigs = [
        {
            input: document.getElementById('newPasswordInput'),
            button: document.getElementById('showNewPasswordBtn'),
            icon: document.getElementById('newEyeIcon')
        },
        {
            input: document.getElementById('confirmPasswordInput'),
            button: document.getElementById('showConfirmPasswordBtn'),
            icon: document.getElementById('confirmEyeIcon')
        }
    ];
    
    passwordConfigs.forEach(config => {
        const { input, button, icon } = config;
        
        if (!input || !button || !icon) return;
        
        button.addEventListener('mousedown', () => {
            input.type = 'text';
            icon.src = '/Media/icons8-eye-50.png';
        });
        
        button.addEventListener('mouseup', () => {
            input.type = 'password';
            icon.src = '/Media/icons8-closed-eye-50.png';
        });
        
        button.addEventListener('mouseleave', () => {
            input.type = 'password';
            icon.src = '/Media/icons8-closed-eye-50.png';
        });
    });
    
    // Add Enter key handlers
    document.getElementById('newPasswordInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('confirmPasswordInput').focus();
        }
    });
    
    document.getElementById('confirmPasswordInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('setupBtn').click();
        }
    });
});

// Setup functionality
document.getElementById('setupBtn')?.addEventListener('click', async function() {
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    const setupBtn = document.getElementById('setupBtn');
    
    // Hide previous messages
    errorMsg?.classList.add('d-none');
    successMsg?.classList.add('d-none');
    
    // Validate inputs
    if (!username) {
        errorMsg.textContent = 'Bitte geben Sie einen Benutzernamen ein.';
        errorMsg.classList.remove('d-none');
        return;
    }

    if (!password || !confirmPassword) {
        errorMsg.textContent = 'Bitte füllen Sie beide Passwortfelder aus.';
        errorMsg.classList.remove('d-none');
        return;
    }
    
    if (password !== confirmPassword) {
        errorMsg.textContent = 'Die Passwörter stimmen nicht überein.';
        errorMsg.classList.remove('d-none');
        return;
    }
    
    setupBtn.disabled = true;
    const originalHtml = setupBtn.innerHTML;
    setupBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Setting up...';
    
    try {
        const response = await fetch(`${API_URL}/setup/create-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successMsg.textContent = 'Admin erfolgreich eingerichtet! Weiterleitung zur Anmeldung...';
            successMsg.classList.remove('d-none');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            errorMsg.textContent = data.error || 'Setup failed. Please try again.';
            errorMsg.classList.remove('d-none');
            setupBtn.disabled = false;
            setupBtn.innerHTML = originalHtml;
        }
    } catch (error) {
        console.error('Setup error:', error);
        errorMsg.textContent = 'Connection error. Please try again.';
        errorMsg.classList.remove('d-none');
        setupBtn.disabled = false;
        setupBtn.innerHTML = originalHtml;
    }
});