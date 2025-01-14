import express from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { Server } from 'socket.io';
import onoff from 'onoff';

var relais17 = new onoff.Gpio(17 +512, 'in','both');
var input22 = new onoff.Gpio(22 +512, 'in', 'both');
var input27 = new onoff.Gpio(27 +512, 'in', 'both');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Route om de status van de GPIO-pinnen op te halen
app.get('/gpio-status', (req, res) => {
  const status = {
    gpio17: relais17.readSync(),
    gpio22: input22.readSync(),
    gpio27: input27.readSync(),
  };
  res.json(status);  // retourneer de status als JSON
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.resolve('./public/script.js'));
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
