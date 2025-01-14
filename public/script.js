// Haal de status op wanneer de pagina wordt geladen
function updateGpioStatus() {
  fetch('/gpio-status')
    .then(response => response.json())
    .then(data => {
      document.getElementById('gpio17-status').textContent = data.gpio17 === 1 ? 'ON' : 'OFF';
      document.getElementById('gpio22-status').textContent = data.gpio22 === 1 ? 'ON' : 'OFF';
      document.getElementById('gpio27-status').textContent = data.gpio27 === 1 ? 'ON' : 'OFF';
    })
    .catch(error => {
      console.error('Error fetching GPIO status:', error);
    });
}

// Haal de status op bij het laden van de pagina
updateGpioStatus();
