const remote = require('electron').remote;
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
window.$ = window.jQuery = require('jquery');

const createWindow = remote.getGlobal("createWindow"); //Access the createWindow function
var comPort = remote.getGlobal("comPort");
var portConnection;
var portsOpen = 0;
SerialPort.list((err, ports) => {

  if (ports.length === 0) {
      $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nNo Ports found - try a reboot or check permissions");
  } else {
      $.each(ports, function( index, value ) {
          //Find an arduino uno
          $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nFound " + value["comName"]);
          value["portobject"] = new SerialPort(value["comName"], {
              baudRate: 115200,
              autoOpen:true
          });
          const parser = value["portobject"].pipe(new Readline({ delimiter: '\n', encoding:"utf8" }))

          value["initialdatasent"] = "";
          parser.on('data', function (data) {
              $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nRecieved " + data.replace(/\n|\r/g, "") + " from " + value["comName"]);
              if (data.replace(/\n|\r/g, "") == ("CUEBOK")) {
                  $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nCueB device found at " + value["comName"]);
                  $.each(ports, function( newloopindex, newloopvalue ) {
                      //Find an arduino uno
                      newloopvalue["portobject"].close(function(data) {
                          if (newloopvalue["comName"] == value["comName"]) {
                              $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nConnected to  " + value["comName"]);
                              comPort = value["comName"]; //If we've closed the port we're looking for open it up again with a nice new connection
                              global.comPort = comPort;
                              createWindow(comPort);
                          }
                      });
                  });
              } else {
                  $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nNo CueB device found at " + value["comName"]);
              }
          });
      });
  }
});
$(document).ready(function () {
    $("#offline").on("click", function () {
        createWindow(false);
    });
});