import express from 'express';
import { createServer } from 'node:http';
import path from 'path';
import { Server } from 'socket.io';
import onoff from 'onoff';

var relais = new onoff.Gpio(17+512, 'out'); //use GPIO pin 17, and specify that it is output

var input18 = new onoff.Gpio(18+512, 'in', 'both');
console.log('watch input 18')
input18.watch((err,value) => {console.log(`input18 changed to ${value}`)});
setInterval(() => {console.log(`input18 is ${input18.readSync()}`)},5000);


console.log(relais);
const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.resolve('./public/script.js'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect',()=> {
    console.log('a user is disconnected')
  });
  socket.on('toggle', (msg) =>
  {
  if (relais.readSync() === 0) { //check the pin state, if the state is 0 (or off)
      relais.writeSync(1);
      console.log('set pin state to 1 (turn LED on)');
    } else {
      relais.writeSync(0);
      console.log('set pin state to 0 (turn LED off)');
    }  
  });
  socket.on('chat message', (msg) => 
  {
    console.log(`message is ${msg}`);
    io.emit('chat message', msg);
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});