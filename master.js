const SerialPort = require('serialport')
window.$ = window.jQuery = require('jquery');
portConnection = new SerialPort(comPort, {
    baudRate: 115200
});
portConnection.on('data', function (data) {
    console.log('ARDUINO SAYS:', data);
});