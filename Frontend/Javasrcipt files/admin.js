// Admin Dashboard Script
        const API_URL = 'http://localhost:3000/tickets';
        const AUTH_KEY = 'queueworks_admin_session';
        let selectedTicketId = null;
        let allTickets = [];

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

        // Event listeners
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('Möchten Sie sich wirklich abmelden?')) {
                sessionStorage.removeItem(AUTH_KEY);
                window.location.href = 'login.html';
            }
        });
        
        document.getElementById('lehrjahr').addEventListener('change', (e) => {
            const filterValue = e.target.value;
            loadTickets(filterValue);
        });

        document.getElementById('refresh-tickets').addEventListener('click', () => {
            const lj = document.getElementById('lehrjahr').value;
            loadTickets(lj);
            document.getElementById('notify').textContent = 'Tickets refreshed!';
            setTimeout(() => {
                document.getElementById('notify').textContent = '';
            }, 2000);
        });

        document.getElementById('delete-selected').addEventListener('click', async () => {
            if (!selectedTicketId) {
                alert('Please select a ticket first.');
                return;
            }
            
            if (!confirm(`Delete ticket #${selectedTicketId}? This cannot be undone.`)) return;
            
            try {
                const sessionToken = sessionStorage.getItem(AUTH_KEY);
                const resp = await fetch(`${API_URL}/${selectedTicketId}`, { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });
                if (!resp.ok) throw new Error(`Server ${resp.status}`);
                
                document.getElementById('notify').textContent = 'Ticket deleted successfully.';
                selectedTicketId = null;
                const lj = document.getElementById('lehrjahr').value;
                loadTickets(lj);
            } catch (err) {
                console.error('Failed to delete ticket:', err);
                alert('Error deleting ticket.');
            }
        });

        document.getElementById('delete-all').addEventListener('click', async () => {
            if (!confirm('Delete ALL tickets? This cannot be undone.')) return;
            
            try {
                const sessionToken = sessionStorage.getItem(AUTH_KEY);
                const resp = await fetch(API_URL, { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });
                if (!resp.ok) throw new Error(`Server ${resp.status}`);
                
                document.getElementById('notify').textContent = 'All tickets deleted.';
                selectedTicketId = null;
                loadTickets();
            } catch (err) {
                console.error('Failed to delete all tickets:', err);
                alert('Error deleting tickets.');
            }
        });

        // Initialize
        (async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                loadTickets();
            }
        })();