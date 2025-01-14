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

// Verbind het apparaat met IoT Hub
client.open()
  .then(() => {
    console.log('Verbonden met IoT Hub');
    
    // Telemetrie verzenden om de 5 seconden
    setInterval(() => {
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
    }, 5000);  // Verzend elke 5 seconden
  })
  .catch((err) => {
    console.log('Fout bij verbinden met IoT Hub: ', err.toString());
  });
