// Test Script for API Endpoints
const API_URL = "http://localhost:3000";

async function testTickets() {
  const resultDiv = document.getElementById("tickets-result");
  resultDiv.innerHTML = "<p>Testing...</p>";

  try {
    const response = await fetch(`${API_URL}/tickets`);
    const data = await response.json();
    resultDiv.innerHTML = `
                    <div class="success">
                        <strong>✅ Success!</strong>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;
  } catch (error) {
    resultDiv.innerHTML = `
                    <div class="error">
                        <strong>❌ Error:</strong>
                        <pre>${error.message}</pre>
                        <p>Make sure your server is running on port 3000!</p>
                    </div>
                `;
  }
}

async function testLogin() {
  const resultDiv = document.getElementById("login-result");
  resultDiv.innerHTML = "<p>Testing...</p>";

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test", password: "test" }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      resultDiv.innerHTML = `
                        <div class="${response.ok ? "success" : "error"}">
                            <strong>${response.ok ? "✅" : "⚠️"} Response (${
        response.status
      }):</strong>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                            ${
                              !response.ok
                                ? "<p>This is expected - the endpoint exists!</p>"
                                : ""
                            }
                        </div>
                    `;
    } else {
      const text = await response.text();
      resultDiv.innerHTML = `
                        <div class="error">
                            <strong>❌ Server returned non-JSON response:</strong>
                            <pre>${text}</pre>
                            <p><strong>Problem:</strong> The /auth/login endpoint doesn't exist or isn't configured properly!</p>
                            <p><strong>Solution:</strong> Make sure you updated Backend/main.js with the authentication code.</p>
                        </div>
                    `;
    }
  } catch (error) {
    resultDiv.innerHTML = `
                    <div class="error">
                        <strong>❌ Error:</strong>
                        <pre>${error.message}</pre>
                        <p>Make sure your server is running!</p>
                    </div>
                `;
  }
}
