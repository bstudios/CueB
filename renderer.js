const remote = require('electron').remote;
const SerialPort = require('serialport')
window.$ = window.jQuery = require('jquery');

const createWindow = remote.getGlobal("createWindow")(); //Access the createWindow function
var portConnection;
var portsOpen = 0;
SerialPort.list((err, ports) => {
  console.log('ports', ports);
  if (ports.length === 0) {
    $('#error').html('No ports discovered');
  } else {
      $.each(ports, function( index, value ) {
          //Find an arduino uno
          value["portobject"] = new SerialPort(value["comName"], {
              baudRate: 115200
          });
          value["initialdatasent"] = "";
          value["portobject"].on('data', function (data) {
              console.log(value["comName"] + ':', data);
              $.each(data, function( valuesloopindex, valuesloopvalue ) {
                  value["initialdatasent"] += String.fromCharCode(valuesloopvalue);
                  if (value["initialdatasent"] === "CUEBAUTODETECTONLINE") {
                      $.each(ports, function( newloopindex, newloopvalue ) {
                          //Find an arduino uno
                          newloopvalue["portobject"].close(function(data) {
                              if (newloopvalue["comName"] === value["comName"]) {
                                  comPort = value["comName"]; //If we've closed the port we're looking for open it up again with a nice new connection
                                  createWindow();
                              }
                          });
                      });
                  }
              });
              console.log(value["initialdatasent"]);
          });
      });
  }
});
