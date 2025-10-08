async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('ip').innerText = `Logged IP: ${data.ip}`;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}