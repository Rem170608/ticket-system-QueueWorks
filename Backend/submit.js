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

      const data = await res.json();
      if (data.success) {
        alert("✅ Ticket erfolgreich erstellt!");
      } else {
        alert("❌ Fehler beim Erstellen des Tickets.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler!");
    }
  });
});
