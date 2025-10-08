// Admin Dashboard Script
        const API_URL = 'http://localhost:3000/tickets';
        const AUTH_KEY = 'queueworks_admin_session'; 
        let selectedTicketId = null;
        let allTickets = [];

        // Function to show notification
        function showNotification(message, isError = false) {
            const notify = document.getElementById('notify');
            if (notify) {
                notify.textContent = message;
                notify.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
                notify.style.color = isError ? '#ff0000' : '#008000';
                notify.style.padding = '10px';
                notify.style.borderRadius = '5px';
                notify.style.marginTop = '10px';
                notify.style.marginBottom = '10px';
                notify.style.display = 'block';
                
                // Auto-hide success messages after 3 seconds
                if (!isError) {
                    setTimeout(() => {
                        notify.style.display = 'none';
                    }, 3000);
                }
            }
        }

        // Check authentication on page load
        async function checkAuth() {
            const authCheck = document.getElementById('auth-check');
            const adminContent = document.getElementById('admin-content');
            
            // Check if user has valid session
            const sessionToken = sessionStorage.getItem(AUTH_KEY);
            
            if (!sessionToken) {
                authCheck.innerHTML = `
                    <div class="access-denied">
                        <h2>⛔ Zugriff verweigert</h2>
                        <p>Sie müssen sich anmelden, um auf das Admin-Dashboard zuzugreifen.</p>
                        <a href="login.html">Zur Anmeldung</a>
                    </div>
                `;
                return false;
            }
            
            // Verify session with backend
            try {
                const resp = await fetch('http://localhost:3000/auth/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });
                
                if (!resp.ok) throw new Error('Invalid session');
                
                // Authentication successful
                authCheck.style.display = 'none';
                adminContent.style.display = 'block';
                return true;
            } catch (err) {
                console.error('Auth verification failed:', err);
                sessionStorage.removeItem(AUTH_KEY);
                authCheck.innerHTML = `
                    <div class="access-denied">
                        <h2>⏱️ Sitzung abgelaufen</h2>
                        <p>Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.</p>
                        <a href="login.html">Zur Anmeldung</a>
                    </div>
                `;
                return false;
            }
        }

        async function loadTickets(filterLJ = '') {
            const notify = document.getElementById('notify');
            const container = document.getElementById('tickets-container');
            notify.textContent = '';
            
            try {
                const sessionToken = sessionStorage.getItem(AUTH_KEY);
                const resp = await fetch(API_URL, {
                    headers: {
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });
                
                if (!resp.ok) throw new Error(`Server ${resp.status}`);
                const tickets = await resp.json();
                allTickets = tickets;
                
                // Apply filter if specified
                const filteredTickets = filterLJ 
                    ? tickets.filter(t => t.LJ === filterLJ)
                    : tickets;
                
                renderTickets(filteredTickets);
            } catch (err) {
                console.error('Failed to load tickets:', err);
                notify.textContent = 'Fehler beim Laden der Tickets.';
                container.innerHTML = '';
            }
        }

        function renderTickets(tickets) {
            const container = document.getElementById('tickets-container');
            container.innerHTML = '';
            
            if (!tickets || tickets.length === 0) {
                container.textContent = 'No tickets found.';
                return;
            }
            
            tickets.forEach(t => {
                const el = document.createElement('div');
                el.className = 'ticket-box';
                el.dataset.id = t.id;
                
                if (selectedTicketId === t.id) {
                    el.classList.add('selected');
                }
                
                el.innerHTML = `
                    <div class="ticket-header">
                        <strong>#${t.id}</strong>
                        <em>${escapeHtml(t.cat || '')}</em>
                        <small>${t.LJ || ''}</small>
                    </div>
                    <p><strong>${escapeHtml(t.name)}</strong></p>
                    <p>${escapeHtml(t.msg)}</p>
                `;
                
                el.addEventListener('click', () => {
                    document.querySelectorAll('.ticket-box').forEach(box => box.classList.remove('selected'));
                    el.classList.add('selected');
                    selectedTicketId = t.id;
                });
                
                container.appendChild(el);
            });
        }

        function escapeHtml(s) {
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        async function deleteTickets() {
            const lj = document.getElementById('lehrjahr')?.value || '';
            const isFiltered = lj !== '';
            
            // Prepare confirmation message based on current filter
            const confirmMessage = isFiltered
                ? `Alle Tickets für Lehrjahr ${lj} löschen? Dies kann nicht rückgängig gemacht werden.`
                : 'ALLE Tickets aus ALLEN Lehrjahren löschen? Dies kann nicht rückgängig gemacht werden.';

            if (!confirm(confirmMessage)) return;
            
            try {
                const sessionToken = sessionStorage.getItem(AUTH_KEY);

                if (isFiltered) {
                    // Get tickets for the selected Lehrjahr
                    const ticketsToDelete = allTickets.filter(t => t.LJ === lj);
                    
                    if (ticketsToDelete.length === 0) {
                        showNotification('Keine Tickets für dieses Lehrjahr gefunden.', true);
                        return;
                    }

                    // Delete filtered tickets one by one
                    for (const ticket of ticketsToDelete) {
                        await fetch(`${API_URL}/${ticket.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${sessionToken}`
                            }
                        });
                    }
                    showNotification(`Alle Tickets für Lehrjahr ${lj} gelöscht.`);
                } else {
                    // No filter selected - delete all tickets
                    const resp = await fetch(API_URL, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${sessionToken}`
                        }
                    });
                    if (!resp.ok) throw new Error(`Server ${resp.status}`);
                    showNotification('Alle Tickets aus allen Lehrjahren gelöscht.');
                }
                
                selectedTicketId = null;
                loadTickets(lj); // Keep the current filter when reloading
            } catch (err) {
                console.error('Failed to delete tickets:', err);
                showNotification('Fehler beim Löschen der Tickets.', true);
            }
        }

        // Initialize when document is ready
        document.addEventListener('DOMContentLoaded', async () => {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) return;
            
            // Load initial tickets
            loadTickets();
            
            // Setup all event listeners after authentication
            const setupEventListeners = () => {
                // Logout button
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                            sessionStorage.removeItem(AUTH_KEY);
                            window.location.href = 'login.html';
                    });
                }
                
                // Filter dropdown
                const lehrjahrSelect = document.getElementById('lehrjahr');
                if (lehrjahrSelect) {
                    lehrjahrSelect.addEventListener('change', (e) => {
                        loadTickets(e.target.value);
                    });
                }

                // Refresh button
                const refreshBtn = document.getElementById('refresh-tickets');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => {
                        const lj = document.getElementById('lehrjahr')?.value || '';
                        loadTickets(lj);
                        const notify = document.getElementById('notify');
                        if (notify) {
                            notify.textContent = 'Tickets refreshed!';
                            setTimeout(() => {
                                notify.textContent = '';
                            }, 2000);
                        }
                    });
                }

                // Delete selected ticket button
                const deleteSelectedBtn = document.getElementById('delete-selected');
                if (deleteSelectedBtn) {
                    deleteSelectedBtn.addEventListener('click', async () => {
                        if (!selectedTicketId) {
                            showNotification('Bitte wählen Sie zuerst ein Ticket aus.', true);
                            return;
                        }
                        
                        if (!confirm(`Ticket #${selectedTicketId} löschen? Dies kann nicht rückgängig gemacht werden.`)) return;
                        
                        try {
                            const sessionToken = sessionStorage.getItem(AUTH_KEY);
                            const resp = await fetch(`${API_URL}/${selectedTicketId}`, { 
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${sessionToken}`
                                }
                            });
                            if (!resp.ok) throw new Error(`Server ${resp.status}`);
                            
                            showNotification('Ticket erfolgreich gelöscht.');
                            selectedTicketId = null;
                            const lj = document.getElementById('lehrjahr')?.value || '';
                            loadTickets(lj);
                        } catch (err) {
                            console.error('Failed to delete ticket:', err);
                            showNotification('Fehler beim Löschen des Tickets.', true);
                        }
                    });
                }

                // Delete all tickets button (respects current filter)
                const deleteAllBtn = document.getElementById('delete-all');
                if (deleteAllBtn) {
                    deleteAllBtn.addEventListener('click', () => deleteTickets());
                }
            };

            // Set up all event listeners
            setupEventListeners();
        });
