import pkg from 'azure-iot-device';  // Importeren als default
import * as mqtt from 'azure-iot-device-mqtt';
import onoff from 'onoff';

// Haal Client en Message uit de default import
const { Client, Message } = pkg;

// Set up de GPIO pins
const input17 = new onoff.Gpio(17+512, 'in', 'both');
const input22 = new onoff.Gpio(22+512, 'in', 'both');
const input27 = new onoff.Gpio(27+512, 'in', 'both');

// Verbinden met Azure IoT Hub
const connectionString = "HostName=Opdracht2.azure-devices.net;DeviceId=rpi-wl;SharedAccessKey=hvqEK5A3A3jb+8XpmFYc6x0350pDqtC8SAYEPET4sqU=";
const client = Client.fromConnectionString(connectionString, mqtt.Mqtt);

// Standaard poll interval (5 seconden)
let pollInterval = 5000;
let pollingIntervalID = null;  // Variabele om de setInterval op te slaan, zodat we deze kunnen stoppen

// Functie om te reageren op veranderingen in de desired property
const handleDesiredPropertyUpdate = (request, response) => {
  if (request && request.payload && request.payload.properties && request.payload.properties.desired) {
    const desired = request.payload.properties.desired;
    if (desired.pollInterval) {
      pollInterval = desired.pollInterval;  // Bijwerken van het poll interval
      console.log(`Poll interval bijgewerkt naar: ${pollInterval} milliseconden`);
    }
  }
  // Bevestig de update
  response.send(200);
};

// Functie om polling te starten
const startPolling = (request, response) => {
  if (!pollingIntervalID) {  // Controleer of het pollingproces al actief is
    pollingIntervalID = setInterval(() => {
      const gpioStatus = {
        gpio17: input17.readSync() === 1 ? 'high' : 'low',
        gpio22: input22.readSync() === 1 ? 'high' : 'low',
        gpio27: input27.readSync() === 1 ? 'high' : 'low'
      };

      const message = new Message(JSON.stringify(gpioStatus));
      console.log('Verstuur bericht naar IoT Hub: ', gpioStatus);

      client.sendEvent(message, (err) => {
        if (err) {
          console.log('Fout bij het verzenden van bericht: ', err.toString());
        } else {
          console.log('Bericht succesvol verzonden!');
        }
      });
    }, pollInterval);  // Gebruik de gewenste pollInterval
    response.send(200, 'Polling gestart');
    console.log('Polling gestart');
  } else {
    response.send(400, 'Polling is al gestart');
  }
};

// Functie om polling te stoppen
const stopPolling = (request, response) => {
  if (pollingIntervalID) {
    clearInterval(pollingIntervalID);  // Stop het interval
    pollingIntervalID = null;
    response.send(200, 'Polling gestopt');
    console.log('Polling gestopt');
  } else {
    response.send(400, 'Polling is nog niet gestart');
  }
};

// Verbind het apparaat met IoT Hub
client.open()
  .then(() => {
    console.log('Verbonden met IoT Hub');
    
    // Luister naar updates voor desired properties
    client.onDeviceMethod('update', handleDesiredPropertyUpdate);
    client.onDeviceMethod('startPolling', startPolling);
    client.onDeviceMethod('stopPolling', stopPolling);

  })
  .catch((err) => {
    console.log('Fout bij verbinden met IoT Hub: ', err.toString());
  });
