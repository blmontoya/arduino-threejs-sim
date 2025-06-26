const express = require('express');
const http = require('http');
const path = require('path');
const { SerialPort, ReadlineParser} = require('serialport');

const app = express();
app.set('PORT', 9000);
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, '../client/')));

server.listen(app.get('PORT'), ()=>{
    console.log("server working on the port", app.get('PORT'));
})

// socket communication
const io = require('socket.io')(server);

// serial communication

const port = new SerialPort(
    {path: 'COM4',
    baudRate: 115200}
)

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n'}));

let counter = 0;
let lastEmit = 0;

parser.on('data', (data) => {
  counter++;
  const now = Date.now();

  // Optional: always log raw data if needed
  // console.log('RAW:', JSON.stringify(data));

  if (data.includes('ypr')) {
    // Print only every 10th YPR line to avoid log spam
    if (counter % 10 === 0) {
      console.log('YPR:', data);
    }

    // Throttle socket emit to 30 FPS max (every ~33ms)
    if (now - lastEmit > 33) {
      lastEmit = now;
      io.emit('spin data', data);
    }
  }
});

port.on('error', (err) => {
  console.error('Serial port error:', err.message);
});

port.on('close', () => {
  console.warn('Serial port closed.');
});


/*
parser.on('data', (data)=>{
    if(data.includes('ypr')){
        console.log(data);
        io.emit('spin data', data);
    }
    
})
*/
