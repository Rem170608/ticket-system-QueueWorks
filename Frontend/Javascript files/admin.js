// ===============================
// Admin Dashboard Script (Cleaned)
// ===============================

const API_URL = 'http://localhost:3000/tickets';
const AUTH_KEY = 'queueworks_admin_session';
let selectedTicketIds = new Set();
let allTickets = [];
let lastKnownIds = new Set();

// ===============================
// Notifications
// ===============================
function showNotification(message, isError = false) {
    const notify = document.getElementById('notify');
    if (!notify) return;

    notify.textContent = message;
    notify.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
    notify.style.color = isError ? '#ff0000' : '#008000';
    notify.style.padding = '10px';
    notify.style.borderRadius = '5px';
    notify.style.margin = '10px 0';
    notify.style.display = 'block';

    // Auto-hide success messages
    if (!isError) {
        setTimeout(() => (notify.style.display = 'none'), 1000);
    }
}

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Notifications not supported in this browser");
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        if (permission === "granted") {
            showNotification("Benachrichtigungen aktiviert");
            return true;
        }
    } catch (err) {
        console.error("Error requesting notification permission:", err);
    }
    return false;
}

// ===============================
// Authentication
// ===============================
// ===============================
// Authentication
// ===============================
async function checkAuth() {
    const authCheck = document.getElementById('auth-check');
    const adminContent = document.getElementById('admin-content');
    const sessionToken = sessionStorage.getItem(AUTH_KEY);

    // If there’s no stored session → block access
    if (!sessionToken) {
        if (authCheck) {
            authCheck.innerHTML = `
                <div class="access-denied text-center mt-4">
                    <h2>⛔ Zugriff verweigert</h2>
                    <p>Sie müssen sich anmelden, um auf das Admin-Dashboard zuzugreifen.</p>
                    <a href="login.html" class="btn btn-primary mt-2">Zur Anmeldung</a>
                </div>`;
        }
        if (adminContent) adminContent.classList.add('d-none');
        return false;
    }

    // Verify token with backend
    try {
        const resp = await fetch('http://localhost:3000/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            },
        });

        if (!resp.ok) throw new Error('Invalid session');

        // ✅ Auth success → hide loading, show admin
        if (authCheck) authCheck.classList.add('d-none');
        if (adminContent) {
            adminContent.classList.remove('d-none'); // remove Bootstrap “display: none”
            adminContent.style.display = 'block';
        }

        return true;
    } catch (err) {
        console.error('Auth verification failed:', err);
        sessionStorage.removeItem(AUTH_KEY);

        if (authCheck) {
            authCheck.innerHTML = `
                <div class="access-denied text-center mt-4">
                    <h2>⏱️ Sitzung abgelaufen</h2>
                    <p>Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.</p>
                    <a href="login.html" class="btn btn-primary mt-2">Zur Anmeldung</a>
                </div>`;
        }

        if (adminContent) adminContent.classList.add('d-none');
        return false;
    }
}

// ===============================
// Ticket Handling
// ===============================
async function loadTickets(filterLJ = '', clearNotification = true) {
    const notify = document.getElementById('notify');
    const container = document.getElementById('tickets-container');

    if (!container) return;

    if (clearNotification && notify) {
        notify.textContent = '';
        notify.style.display = 'none';
    }

    try {
        const sessionToken = sessionStorage.getItem(AUTH_KEY);
        const resp = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (!resp.ok) throw new Error(`Server ${resp.status}`);

        const tickets = await resp.json();
        allTickets = tickets;

        const filteredTickets = filterLJ
            ? tickets.filter(t => t.LJ === filterLJ)
            : tickets;

        renderTickets(filteredTickets);
    } catch (err) {
        console.error('Failed to load tickets:', err);
        if (notify) {
            notify.textContent = 'Fehler beim Laden der Tickets.';
            notify.style.display = 'block';
        }
        container.innerHTML = '';
    }
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTickets(tickets) {
    const container = document.getElementById('tickets-container');
    if (!container) return;

    container.innerHTML = '';

    if (!tickets || tickets.length === 0) {
        container.textContent = 'Keine Tickets gefunden.';
        return;
    }

    tickets.forEach(t => {
        const el = document.createElement('div');
        el.className = `ticket-box${t.cat || ''}`;
        el.dataset.id = t.id;

        if (selectedTicketIds.has(t.id)) el.classList.add('selected');

        el.innerHTML = `
            <small>${escapeHtml(t.time || '')}</small>
            <div class="ticket-header">
                <strong>#${escapeHtml(t.id)}</strong>
                <small>${escapeHtml(t.LJ || '')}</small>
            </div>
            <p><strong>${escapeHtml(t.name || '')}</strong></p>
            <p>${escapeHtml(t.msg || '')}</p>
        `;

        el.addEventListener('click', () => {
            if (selectedTicketIds.has(t.id)) {
                selectedTicketIds.delete(t.id);
                el.classList.remove('selected');
            } else {
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
    if (!deleteBtn) return;
    deleteBtn.textContent =
        count > 0 ? `Ausgewählte löschen (${count})` : 'Ausgewählte löschen';
}

async function deleteTickets() {
    const lj = document.getElementById('lehrjahr')?.value || '';
    const isFiltered = lj !== '';
    const confirmMessage = isFiltered
        ? `Alle Tickets für Lehrjahr ${lj} löschen? Dies kann nicht rückgängig gemacht werden.`
        : 'ALLE Tickets aus ALLEN Lehrjahren löschen? Dies kann nicht rückgängig gemacht werden.';

    if (!confirm(confirmMessage)) return;

    try {
        const sessionToken = sessionStorage.getItem(AUTH_KEY);

        if (isFiltered) {
            const ticketsToDelete = allTickets.filter(t => t.LJ === lj);
            if (ticketsToDelete.length === 0) {
                showNotification('Keine Tickets für dieses Lehrjahr gefunden.', true);
                return;
            }

            for (const ticket of ticketsToDelete) {
                await fetch(`${API_URL}/${ticket.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${sessionToken}` },
                });
            }
            showNotification(`Tickets erfolgreich gelöscht (${ticketsToDelete.length} für Lehrjahr ${lj})`);
        } else {
            const resp = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${sessionToken}` },
            });
            if (!resp.ok) throw new Error(`Server ${resp.status}`);
            showNotification('Alle Tickets erfolgreich gelöscht');
        }

        selectedTicketIds.clear();
        loadTickets(lj, false);
    } catch (err) {
        console.error('Failed to delete tickets:', err);
        showNotification('Fehler beim Löschen der Tickets.', true);
    }
}

// ===============================
// Ticket Polling for Notifications
// ===============================
async function checkForNewTickets() {
    try {
        const sessionToken = sessionStorage.getItem(AUTH_KEY);
        const resp = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (!resp.ok) throw new Error(`Server ${resp.status}`);

        const tickets = await resp.json();

        // First run — store initial IDs
        if (lastKnownIds.size === 0) {
            tickets.forEach(t => lastKnownIds.add(t.id));
            return;
        }

        // Find new tickets
        const newTickets = tickets.filter(t => !lastKnownIds.has(t.id));
        if (newTickets.length > 0 && Notification.permission === "granted") {
            for (const t of newTickets) {
                new Notification(`${t.name}`, {
                    body: `Nachricht: ${t.msg}\nZeit: ${t.time}`,
                    icon: "/Media/head.svg",
                    tag: `new-ticket-${t.id}`,
                });
            }
        }

        lastKnownIds = new Set(tickets.map(t => t.id));
    } catch (err) {
        console.error('Error checking for new tickets:', err);
    }
}

// ===============================
// Initialization
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    await requestNotificationPermission();
    await loadTickets();

    // Start polling every 20 seconds
    setInterval(checkForNewTickets, 20000);

    // ===============================
    // Event Listeners
    // ===============================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(AUTH_KEY);
            window.location.href = 'login.html';
        });
    }

    const lehrjahrSelect = document.getElementById('lehrjahr');
    if (lehrjahrSelect) {
        lehrjahrSelect.addEventListener('change', (e) => {
            selectedTicketIds.clear();
            loadTickets(e.target.value);
        });
    }

    const refreshBtn = document.getElementById('refresh-tickets');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const lj = document.getElementById('lehrjahr')?.value || '';
            loadTickets(lj);
            showNotification('Tickets aktualisiert');
        });
    }

    const deleteSelectedBtn = document.getElementById('delete-selected');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', async () => {
            if (selectedTicketIds.size === 0) {
                showNotification('Bitte wählen Sie zuerst ein oder mehrere Tickets aus.', true);
                return;
            }

            const count = selectedTicketIds.size;
            const confirmMsg =
                count === 1
                    ? `Ticket #${[...selectedTicketIds][0]} löschen?`
                    : `${count} Tickets löschen? Dies kann nicht rückgängig gemacht werden.`;
            if (!confirm(confirmMsg)) return;

            try {
                const sessionToken = sessionStorage.getItem(AUTH_KEY);
                for (const id of selectedTicketIds) {
                    await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${sessionToken}` },
                    });
                }
                showNotification(`${count} Ticket(s) erfolgreich gelöscht`);
                selectedTicketIds.clear();
                const lj = document.getElementById('lehrjahr')?.value || '';
                loadTickets(lj, false);
            } catch (err) {
                console.error('Failed to delete selected tickets:', err);
                showNotification('Fehler beim Löschen der Tickets.', true);
            }
        });
    }

    const deleteAllBtn = document.getElementById('delete-all');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => deleteTickets());
    }
});