const API_URL = 'http://localhost:3000/tickets';

    async function loadTickets() {
      const notify = document.getElementById('notify');
      const container = document.getElementById('tickets-container');
      notify.textContent = '';

      try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error(`Server ${resp.status}`);
        const tickets = await resp.json();
        renderTickets(tickets);
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

      tickets.slice(0, 9).forEach(t => {
        const el = document.createElement('div');
        el.className = 'ticket-box';
        el.innerHTML = `
          <small>${t.LJ || ''}</small>
          <p><strong>${escapeHtml(t.name)}</strong><br>${escapeHtml(t.msg)}</p>
        `;
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

    // Auto-refresh every 10 seconds
    loadTickets();
    setInterval(loadTickets, 10000);