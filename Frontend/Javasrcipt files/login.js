const AUTH_KEY = 'queueworks_admin_session';
        const API_URL = 'http://localhost:3000';

        // Check if admin exists and redirect to setup if needed
        async function checkAdminSetup() {
            try {
                const response = await fetch(`${API_URL}/auth/check-admin`);
                const data = await response.json();
                
                if (!data.adminExists) {
                    // Redirect to setup page if admin doesn't exist
                    window.location.href = 'admin-setup.html';
                }

                // Update login nav link to point to login.html since admin exists
                const loginNavLink = document.getElementById('loginNavLink');
                if (loginNavLink) {
                    loginNavLink.href = 'login.html';
                }
            } catch (error) {
                console.error('Setup check error:', error);
                document.getElementById('errorMessage').textContent = 'Server nicht erreichbar';
                document.getElementById('errorMessage').style.display = 'block';
            }
        }


        // Initialize password toggle
        document.addEventListener('DOMContentLoaded', function () {
            // Check for setup messages
            const setupMessage = sessionStorage.getItem('setupMessage');
            if (setupMessage) {
                document.getElementById('errorMessage').textContent = setupMessage;
                document.getElementById('errorMessage').style.display = 'block';
                sessionStorage.removeItem('setupMessage');
            }

            // Check admin setup status
            checkAdminSetup();

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
            const password = document.getElementById('passwordInput').value;
            const errorMsg = document.getElementById('errorMessage');
            const successMsg = document.getElementById('successMessage');
            const loginBtn = document.getElementById('loginBtn');
            
            // Hide previous messages
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';
            
            // Validate input
            if (!password) {
                errorMsg.textContent = 'Bitte Passwort eingeben.';
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
                        username: 'noserq_user',
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
                    }, 1000);
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