document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submitBtn").addEventListener("click", async () => {
    const name = document.getElementById("nameInput").value.trim();
    const category = document.getElementById("category").value;
    const lehrjahr = document.getElementById("lehrjahr").value;
    const description = document.getElementById("descriptionInput").value.trim();

    if (!name || !category || !lehrjahr || !description) {
      alert("Bitte fülle alle Felder aus!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, lehrjahr, description })
      });

      // try to parse JSON if possible
      let data = null;
      try { data = await res.json(); } catch(e) { data = null; }

      if (res.ok && data && data.success) {
        // append server-returned ticket to localStorage so live views update
        try {
          const storageKey = 'queueworks_tickets';
          const ticket = data.ticket || { id: Date.now(), name, category, lehrjahr, desc: description, created: new Date().toISOString() };
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          existing.push(ticket);
          localStorage.setItem(storageKey, JSON.stringify(existing));
        } catch (e) {
          console.warn('Failed to write ticket to localStorage', e);
        }
        alert("✅ Ticket erfolgreich erstellt!");
      } else {
        // server responded but indicated failure
        // fallback to local save so the ticket isn't lost
        try {
          const storageKey = 'queueworks_tickets';
          const ticket = { id: Date.now(), name, category, lehrjahr, desc: description, created: new Date().toISOString() };
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          existing.push(ticket);
          localStorage.setItem(storageKey, JSON.stringify(existing));
          alert('Ticket saved locally (server reported an error).');
        } catch (e) {
          console.error('Failed to save ticket locally after server error', e);
          alert('❌ Fehler beim Erstellen des Tickets.');
        }
      }
    } catch (err) {
      console.error(err);
      // network/server failed — save locally so the ticket isn't lost
      try {
        const storageKey = 'queueworks_tickets';
        const ticket = { id: Date.now(), name, category, lehrjahr, desc: description, created: new Date().toISOString() };
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existing.push(ticket);
        localStorage.setItem(storageKey, JSON.stringify(existing));
        alert('Ticket submitted locally (offline mode).');
      } catch (e) {
        console.error('Failed to save ticket locally', e);
        alert('Serverfehler!');
      }
    }
  });
});
