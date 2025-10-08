        async function getIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                document.getElementById('ip').innerText = `Remember we have your IP: ${data.ip}`;
            } catch (error) {
                console.error('Error fetching IP address:', error);
            }
        }