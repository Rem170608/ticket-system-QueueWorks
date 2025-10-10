// Admin Dashboard Script
const API_URL = 'http://localhost:3000/tickets';
const AUTH_KEY = 'queueworks_admin_session'; 
let selectedTicketIds = new Set(); // Changed to Set for multiple selections
let allTickets = [];

// Function to request notification permission
async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        showNotification("Benachrichtigungen aktiviert", false);
        return true;
    }
    return false;
}

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
            }, 1000);
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

async function loadTickets(filterLJ = '', clearNotification = true) {
    const notify = document.getElementById('notify');
    const container = document.getElementById('tickets-container');
    
    // Only clear notification if explicitly requested
    if (clearNotification && notify) {
        notify.textContent = '';
        notify.style.display = 'none';
    }
    
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
        container.textContent = 'Keine Tickets gefunden.';
        return;
    }
    
    tickets.forEach(t => {
        const el = document.createElement('div');
        el.className = `ticket-box${t.cat || ''}`;
        el.dataset.id = t.id;
        
        // Check if this ticket is selected
        if (selectedTicketIds.has(t.id)) {
            el.classList.add('selected');
        }
        
        el.innerHTML = `
        <small>${t.time || ''}</small>
            <div class="ticket-header">
                <strong>#${t.id}</strong>
                <small>${escapeHtml(t.LJ || '')}</small>
            </div>
            <p><strong>${escapeHtml(t.name)}</strong></p>
            <p>${escapeHtml(t.msg)}</p>
            
        `;
        
        // Toggle selection on click
        el.addEventListener('click', () => {
            if (selectedTicketIds.has(t.id)) {
                // Deselect
                selectedTicketIds.delete(t.id);
                el.classList.remove('selected');
            } else {
                // Select
                selectedTicketIds.add(t.id);
                el.classList.add('selected');
            }
            updateSelectionCount();
        });
        
        container.appendChild(el);
    });
    
    updateSelectionCount();
}

function updateSelectionCount() {
    const count = selectedTicketIds.size;
    const deleteBtn = document.getElementById('delete-selected');
    if (deleteBtn) {
        if (count > 0) {
            deleteBtn.textContent = `Ausgewählte löschen (${count})`;
        } else {
            deleteBtn.textContent = 'Ausgewählte löschen';
        }
    }
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
            showNotification(`Tickets erfolgreich gelöscht (${ticketsToDelete.length} Tickets für Lehrjahr ${lj})`);
        } else {
            // No filter selected - delete all tickets
            const resp = await fetch(API_URL, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });
            if (!resp.ok) throw new Error(`Server ${resp.status}`);
            showNotification('Tickets erfolgreich gelöscht (alle Tickets aus allen Lehrjahren)');
        }
        
        selectedTicketIds.clear();
        loadTickets(lj, false); // Keep the current filter when reloading, don't clear notification
    } catch (err) {
        console.error('Failed to delete tickets:', err);
        showNotification('Fehler beim Löschen der Tickets.', true);
    }
}

// Function to request notification permission
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
    }

    console.log('Current notification permission:', Notification.permission);
    try {
        const permission = await Notification.requestPermission();
        console.log('Permission after request:', permission);
    
    } catch (err) {
        console.error("Error requesting notification permission:", err);
    }
    return false;
}

// Function to check for new tickets
let lastKnownIds = new Set();
async function checkForNewTickets() {
    try {
        const sessionToken = sessionStorage.getItem(AUTH_KEY);
        const resp = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        
        if (!resp.ok) throw new Error(`Server ${resp.status}`);
        const tickets = await resp.json();
        console.log('All current tickets:', tickets);

        // On first run, just store the IDs
        if (lastKnownIds.size === 0) {
            console.log('First run - storing initial ticket IDs');
            tickets.forEach(ticket => lastKnownIds.add(ticket.id));
            return;
        }

        // Find new tickets by comparing IDs
        const newTickets = tickets.filter(ticket => !lastKnownIds.has(ticket.id));
        console.log('New tickets found:', newTickets);

        // If we have new tickets, show notifications
        if (newTickets.length > 0) {
            console.log('New tickets to notify about:', newTickets.length);
            
            if (Notification.permission === "granted") {
                // Show a notification for each new ticket
                for (const ticket of newTickets) {
                    console.log('Creating notification for ticket:', ticket);
                    try {
                            const notification = new Notification(`${ticket.name}`, {
                                body: `Nachricht: ${ticket.msg}\nZeit: ${ticket.time}`,
                                icon: "/Media/head.svg",
                                tag: 'new-ticket-' + ticket.id, // Ensures unique notification per ticket
                            });

                        notification.onclick = function() {
                            window.focus();
                        };
                        console.log('Notification created successfully');
                    } catch (notifError) {
                        console.error('Error creating notification:', notifError);
                    }
                    lastKnownIds.add(ticket.id);
                }
            } else {
                console.log('Notifications not permitted:', Notification.permission);
            }
        } else {
            console.log('No new tickets found');
        }

        // Update known IDs
        lastKnownIds.clear();
        tickets.forEach(ticket => lastKnownIds.add(ticket.id));
    } catch (err) {
        console.error("Error checking for new tickets:", err);
    }
}

        // Start checking immediately and then every 20 seconds
setInterval(checkForNewTickets, 1000);  // Check every 20 seconds (20 * 1000 ms)
checkForNewTickets(); // Initial check

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    // Request notification permission
    await requestNotificationPermission();
    
    // Load initial tickets
    await loadTickets();
    
    // Start checking for new tickets every 20 seconds
    setInterval(checkForNewTickets, 20000);
    
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
                selectedTicketIds.clear(); // Clear selections when filtering
                loadTickets(e.target.value);
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-tickets');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                const lj = document.getElementById('lehrjahr')?.value || '';
                loadTickets(lj);
                showNotification('Tickets aktualisiert', false);
                });
        }

        // Delete selected ticket(s) button
        const deleteSelectedBtn = document.getElementById('delete-selected');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', async () => {
                if (selectedTicketIds.size === 0) {
                    showNotification('Bitte wählen Sie zuerst ein oder mehrere Tickets aus.', true);
                    return;
                }

                const count = selectedTicketIds.size;
                const ticketText = count === 1 ? 'Ticket' : 'Tickets';
                const confirmMessage = count === 1 
                    ? `Ticket #${[...selectedTicketIds][0]} löschen? Dies kann nicht rückgängig gemacht werden.`
                    : `${count} Tickets löschen? Dies kann nicht rückgängig gemacht werden.`;

                if (!confirm(confirmMessage)) {
                    return;
                }

                try {
                    const sessionToken = sessionStorage.getItem(AUTH_KEY);
                    const idsToDelete = [...selectedTicketIds];
                    
                    // Delete each selected ticket
                    for (const ticketId of idsToDelete) {
                        const resp = await fetch(`${API_URL}/${ticketId}`, { 
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${sessionToken}`
                            }
                        });
                        if (!resp.ok) throw new Error(`Server ${resp.status}`);
                    }
                    
                    showNotification(`Ticket${count > 1 ? 's' : ''} erfolgreich gelöscht (${count} ${ticketText})`);
                    selectedTicketIds.clear();
                    const lj = document.getElementById('lehrjahr')?.value || '';
                    loadTickets(lj, false); // Don't clear notification
                } catch (err) {
                    console.error('Failed to delete tickets:', err);
                    showNotification('Fehler beim Löschen der Tickets.', true);
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