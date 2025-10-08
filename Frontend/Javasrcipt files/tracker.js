let cachedIP = null;

async function getIP() {
    if (cachedIP) {
        return cachedIP;
    }
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        cachedIP = data.ip;
        document.getElementById('ip').innerText = `Logged IP: ${cachedIP}`;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }

    if ("geolocation" in navigator) {
        console.log("Geolocation is supported.");
    } else {
        console.log("Geolocation is not supported.");
    }
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log(`Latitude: ${lat}, Longitude: ${lon}`);
      document.getElementById('loc').innerText = `Latitude: ${lat}, Longitude: ${lon}`;
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}
