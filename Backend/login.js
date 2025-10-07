function showpasswordbtn(all){
                const passwordInput = document.getElementById('passwordInput');
                const showPasswordBtn = document.getElementById('showPasswordBtn');
                const eyeIcon = document.getElementById('eyeIcon');

                // Show password while the user is pressing the button (mouse, touch, or keyboard)
                function showPassword() {
                    passwordInput.type = 'text';
                    eyeIcon.src = '/Media/icons8-eye-50.png';
                    showPasswordBtn.setAttribute('aria-pressed', 'true');
                }

                function hidePassword() {
                    passwordInput.type = 'password';
                    eyeIcon.src = '/Media/icons8-closed-eye-50.png';
                    showPasswordBtn.setAttribute('aria-pressed', 'false');
                }

                // Pointer events (mouse / touch / stylus)
                showPasswordBtn.addEventListener('pointerdown', (e) => {
                    // Only respond to primary button
                    if (e.isPrimary) {
                        showPassword();
                    }
                });
                // End showing on pointerup, pointercancel, or pointerleave
                ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
                    showPasswordBtn.addEventListener(evt, hidePassword);
                });

                // Also ensure we hide when the pointer leaves the button (for mouse)
                showPasswordBtn.addEventListener('mouseleave', hidePassword);

                // Keyboard: show while space or enter is held
                showPasswordBtn.addEventListener('keydown', (e) => {
                    if (e.code === 'Space' || e.code === 'Enter') {
                        // Prevent scrolling on Space
                        e.preventDefault();
                        showPassword();
                    }
                });
                showPasswordBtn.addEventListener('keyup', (e) => {
                    if (e.code === 'Space' || e.code === 'Enter') {
                        hidePassword();
                    }
                });

                // Safety: if focus leaves the button, hide password
                showPasswordBtn.addEventListener('blur', hidePassword);

1            }

// Express server setup