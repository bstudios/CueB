const SerialPort = require('serialport')
window.$ = window.jQuery = require('jquery');

const remote = require('electron').remote;
var comPort = remote.getGlobal("comPort");
console.log(comPort);


portConnection = new SerialPort(comPort, {
    baudRate: 115200
});
portConnection.on('data', function (data) {
    var output = "";
    $.each(data, function( index, value ) {
        output += String.fromCharCode(value);
    });
    console.log(output);
});