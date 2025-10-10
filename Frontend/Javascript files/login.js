const API_URL = 'http://localhost:3000';
const AUTH_KEY = 'queueworks_admin_session';

async function checkAdminNotexisting() {
    try {
        const response = await fetch(`${API_URL}/auth/check-admin`);
        
        // Log the response details for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        // Handle non-200 responses
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
            // If admin does not exist, redirect to setup
            setTimeout(() => {
                console.log('Admin does not exist, redirecting to setup page');
                window.location.href = '/Frontend/Html files/admin-setup.html';
                sessionStorage.setItem('setupMessage', 'Admin existiert nicht. Weiterleitung...');
            }, 2000);
            return;
        }   

        // If admin exists, show setup form (we're on the setup page)
        console.log('Admin exists');
        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            setupForm.style.display = 'block';
        }
        
        // Clear any existing error messages
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Setup check error:', error);
        // Show more specific error message
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            if (error.message.includes('Failed to fetch')) {
                errorMessage.textContent = 'Server nicht erreichbar. Bitte stellen Sie sicher, dass der Server läuft und auf Port 3000 erreichbar ist.';
            } else {
                errorMessage.textContent = `Fehler beim Überprüfen des Admin-Status: ${error.message}`;
            }
            errorMessage.style.display = 'block';
        }
    }
}

// ✅ CORRECT - Event listeners are OUTSIDE the function
document.addEventListener('DOMContentLoaded', function () {
    // Check if admin exists
    checkAdminNotexisting();
    
    // Check for setup messages
    const setupMessage = sessionStorage.getItem('setupMessage');
    if (setupMessage) {
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.textContent = setupMessage;
            errorMsg.style.display = 'block';
            sessionStorage.removeItem('setupMessage');
        }
    }

    // Setup password toggle with mousedown/mouseup
    const passwordInput = document.getElementById('passwordInput');
    const showPasswordBtn = document.getElementById('showPasswordBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (showPasswordBtn && passwordInput && eyeIcon) {
        // Show password on mousedown
        showPasswordBtn.addEventListener('mousedown', () => {
            passwordInput.type = 'text';
            eyeIcon.src = '/Media/icons8-eye-50.png';
        });
        
        // Hide password on mouseup or mouseleave
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
    const passwordInputField = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    if (passwordInputField && loginBtn) {
        passwordInputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }
});

// Initialize password toggle and setup event handlers
document.addEventListener('DOMContentLoaded', function () {
    // Check for setup messages
    const setupMessage = sessionStorage.getItem('setupMessage');
    if (setupMessage) {
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.textContent = setupMessage;
            errorMsg.style.display = 'block';
            sessionStorage.removeItem('setupMessage');
        }
    }

            // Setup password toggle with mousedown/mouseup
            const passwordInput = document.getElementById('passwordInput');
            const showPasswordBtn = document.getElementById('showPasswordBtn');
            const eyeIcon = document.getElementById('eyeIcon');
            
            // Show password on mousedown
            showPasswordBtn.addEventListener('mousedown', () => {
                passwordInput.type = 'text';
                eyeIcon.src = '/Media/icons8-eye-50.png';
            });
            
            // Hide password on mouseup or mouseleave
            showPasswordBtn.addEventListener('mouseup', () => {
                passwordInput.type = 'password';
                eyeIcon.src = '/Media/icons8-closed-eye-50.png';
            });
            
            showPasswordBtn.addEventListener('mouseleave', () => {
                passwordInput.type = 'password';
                eyeIcon.src = '/Media/icons8-closed-eye-50.png';
            });
            
            // Add Enter key handler
            document.getElementById('passwordInput')?.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('loginBtn').click();
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
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';
            
            if(!username && !password) {
                errorMsg.textContent = 'Bitte Benutzername und Passwort eingeben.';
                errorMsg.style.display = 'block';
                return;
            }
            // Validate input
            if (!password) {
                errorMsg.textContent = 'Bitte Passwort eingeben.';
                errorMsg.style.display = 'block';
                return;
            }
            if (!username) {
                errorMsg.textContent = 'Bitte Benutzername eingeben.';
                errorMsg.style.display = 'block';
                return;
            }   
            
            
            // Disable button during request
            loginBtn.disabled = true;
            loginBtn.textContent = 'Logging in...';
            loginBtn.style.opacity = '0.6';
            
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
                
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server hat keine JSON-Antwort zurückgegeben. Läuft der Server?');
                }
                
                const data = await response.json();
                
                if (response.ok && data.token) {
                    sessionStorage.setItem(AUTH_KEY, data.token);
                    successMsg.textContent = 'Login erfolgreich! Weiterleitung...';
                    successMsg.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 750);
                } else {
                    // Show error message
                    console.error('Login failed:', response.ok, data, response.status, response.statusText, data.token, data.message, contentType, response, response.headers);
                    errorMsg.textContent = data.message || 'Ungültiger Username oder Passwort.';
                    errorMsg.style.display = 'block';
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                    loginBtn.style.opacity = '1';
                }
            } catch (error) {
                errorMsg.textContent = 'Verbindungsfehler. Bitte versuchen Sie es erneut.';
                errorMsg.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                loginBtn.style.opacity = '1';
            }
        });

        // Check if already logged in
        window.addEventListener('DOMContentLoaded', () => {
            const token = sessionStorage.getItem(AUTH_KEY);
            if (token) {
                // Verify if token is still valid
                fetch(`${API_URL}/auth/verify`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(resp => {
                    if (resp.ok) {
                        // Already logged in, redirect to admin
                        window.location.href = 'admin.html';
                    }
                })
                .catch(err => {
                    // Token invalid, clear it
                    sessionStorage.removeItem(AUTH_KEY);
                });
            }
        });

