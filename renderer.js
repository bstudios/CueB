const remote = require('electron').remote;
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
window.$ = window.jQuery = require('jquery');

const createWindow = remote.getGlobal("createWindow"); //Access the createWindow function
var comPort = remote.getGlobal("comPort");
var socketPort = remote.getGlobal("socketPort");
var portConnection;
var portsOpen = 0;
SerialPort.list().then(ports => {
    if (ports.length === 0) {
        $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nNo Ports found - try a reboot or check permissions");
    } else {
        $.each(ports, function( index, value ) {
            //Find an arduino uno
            $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nFound " + value["comName"]);
            try {
                value["portobject"] = new SerialPort(value["comName"], {
                    baudRate: 115200,
                    autoOpen:true
                });
            }
            catch(err) {
                value["portobject"] = false;
                console.log(err);
                return true; //Continue statement essentially
            }


            const parser = value["portobject"].pipe(new Readline({ delimiter: '\n', encoding:"utf8" }))

            value["initialdatasent"] = "";
            parser.on('data', function (data) {
                $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nRecieved " + data.replace(/\n|\r/g, "") + " from " + value["comName"]);
                if (data.replace(/\n|\r/g, "") == ("CUEBOK")) {
                    $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nCueB device found at " + value["comName"]);
                    $.each(ports, function( newloopindex, newloopvalue ) {
                        //Find an arduino uno
                        if (newloopvalue["portobject"]) {
                            newloopvalue["portobject"].close(function (data) {
                                if (newloopvalue["comName"] == value["comName"]) {
                                    $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nConnected to  " + value["comName"]);
                                    comPort = value["comName"]; //If we've closed the port we're looking for open it up again with a nice new connection
                                    global.comPort = comPort;
                                    createWindow(comPort, false);
                                }
                            });
                        }
                    });
                } else {
                    $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nNo CueB device found at " + value["comName"]);
                }
            });
        });
    }
});
function findServers(port, ipBase, ipLow, ipHigh, maxInFlight, timeout, cb) {
    var ipCurrent = +ipLow, numInFlight = 0, servers = [];
    ipHigh = +ipHigh;

    function tryOne(ip) {
        ++numInFlight;
        var address = "ws://" + ipBase + ip + ":" + port;
        var socket = new WebSocket(address);
        var timer = setTimeout(function() {
            var s = socket;
            socket = null;
            s.close();
            --numInFlight;
            next();
        }, timeout);
        socket.onopen = function() {
        };
        socket.onmessage = function (event) {
            if (event.data == "CUEBOK") {
                $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\nConnected to  " + socket.url);
                createWindow(false, socket.url);
            }
            if (socket) {
                clearTimeout(timer);
                --numInFlight;
                next();
            }
        }
        socket.onerror = function(err) {
            if (socket) {
                clearTimeout(timer);
                --numInFlight;
                next();
            }
        }
    }

    function next() {
        while (ipCurrent <= ipHigh && numInFlight < maxInFlight) {
            tryOne(ipCurrent++);
        }
        // if we get here and there are no requests in flight, then
        // we must be done
        if (numInFlight === 0) {
            cb();
        }
    }

    next();
}
$('#loadingDebugStream').html($('#loadingDebugStream').html() + "\n" + "Hunting Socket Servers");
findServers(80, "192.168.1.", 1, 255, 20, 5000, function() {
    $('#loadingDebugStream').html($('#loadingDebugStream').html() + "\n" + "No Socket Servers Found");
});
$(document).ready(function () {
    $("#offline").on("click", function () {
        createWindow(false, false);
    });
});