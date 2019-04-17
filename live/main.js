var online;
var parser;
//      Selector
var selectorQueue = [];
//      Flashing
var flash = [];
//      DIV Colour
function setOpacity(e, alpha) { //e = jQuery element, alpha = background-opacity
    b = e.css('backgroundColor');
    e.css('backgroundColor', 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length) ) + ', '+alpha+')');
}
//      GET
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}
//Live ELement
var pusher = new Pusher(findGetParameter("key"), {
    cluster: 'eu',
    forceTLS: true
});

var channel = pusher.subscribe('cueb-events');
var currentDevice = "test";
var knownDevices = [];
channel.bind('cueb-fromdevice', function(data) {
    if (knownDevices.indexOf(data.device) === -1) {
        knownDevices.push(data.device);
        currentDevice = data.device; //TODO actually allow a way of selecting the current device
    }
    if (data.device == currentDevice) {
        recieveMessageOSC(data.payload);
    }
});
channel.bind('cueb-channelConfig', function(data) {
    if (knownDevices.indexOf(data.device) === -1) {
        knownDevices.push(data.device);
        currentDevice = data.device; //TODO actually allow a way of selecting the current device
    }
    if (data.device == currentDevice) {
        $.each( data.channelConfig, function( index, value ){
            $(".channelTitle[data-channel=" + index + "]").html(value.label);
            if (value['label'].length > 3) {
                $(".channelTitle[data-channel=" + index + "]").css("font-size","5vmin");
            }
            if (value.enabled != true) {
                $(".channelTitle[data-channel=" + index + "]").hide();
            };
        });
    }
});
function recieveMessageOSC(output) {
    switch (output) {
        case "CUEBOK":
            break;
        default:
            var outputArray = output.split(",");
            switch (outputArray[0]) {
                /*
                0 = Command
                1 = Channel (0 if not a channel)
                2 = Button id
                3 = Status (0 = up, 1 = down)
                 */
                case "BTNStatus": //This is for startup only really
                    if (outputArray[1] > 0) {
                        //This is an outstation button - these messages are normally delivered on startup
                        if (outputArray[2] == 4) { //Key
                            if (outputArray[3] == 1) {
                                $('.lockIcon[data-channel="' + outputArray[1] + '"]').hide(); //Lock icon
                            } else {
                                $('.lockIcon[data-channel="' + outputArray[1] + '"]').show(); //Lock icon
                            }
                        } else if (outputArray[2] == 5) { //Btn3
                            if (outputArray[3] == 1) {
                                $('.thirdButton[data-channel="' + outputArray[1] + '"]').hide(); //Lock icon
                            } else {
                                $('.thirdButton[data-channel="' + outputArray[1] + '"]').show(); //Lock icon
                            }
                        }
                    }
                    break;
                case "LEDStatus":
                    var LEDSelector = false;
                    switch (parseInt(outputArray[1])) {
                        case 3:
                            LEDSelector = '.standby[data-channel="1"]';
                            break;
                        case 4:
                            LEDSelector = '.go[data-channel="1"]';
                            break;
                        case 22:
                            LEDSelector = '.thirdLED[data-channel="1"]';
                            break;
                        case 5:
                            LEDSelector = '.standby[data-channel="2"]';
                            break;
                        case 6:
                            LEDSelector = '.go[data-channel="2"]';
                            break;
                        case 25:
                            LEDSelector = '.thirdLED[data-channel="2"]';
                            break;
                        case 7:
                            LEDSelector = '.standby[data-channel="3"]';
                            break;
                        case 8:
                            LEDSelector = '.go[data-channel="3"]';
                            break;
                        case 28:
                            LEDSelector = '.thirdLED[data-channel="3"]';
                            break;
                        case 9:
                            LEDSelector = '.standby[data-channel="4"]';
                            break;
                        case 10:
                            LEDSelector = '.go[data-channel="4"]';
                            break;
                        case 31:
                            LEDSelector = '.thirdLED[data-channel="5"]';
                            break;
                        case 11:
                            LEDSelector = '.go[data-channel="master"]';
                            break;
                        case 32:
                            LEDSelector = '.standby[data-channel="master"]';
                            break;
                        case 13:
                            LEDSelector = '.lockIcon[data-channel="1"]';
                            break;
                        case 12:
                            LEDSelector = '.thirdButton[data-channel="1"]';
                            break;
                        case 15:
                            LEDSelector = '.lockIcon[data-channel="2"]';
                            break;
                        case 14:
                            LEDSelector = '.thirdButton[data-channel="2"]';
                            break;
                        case 17:
                            LEDSelector = '.lockIcon[data-channel="3"]';
                            break;
                        case 16:
                            LEDSelector = '.thirdButton[data-channel="3"]';
                            break;
                        case 19:
                            LEDSelector = '.lockIcon[data-channel="4"]';
                            break;
                        case 18:
                            LEDSelector = '.thirdButton[data-channel="4"]';
                            break;
                    }
                    if (LEDSelector) {
                        if (outputArray[2] == 1) {
                            //Turned on
                            $(LEDSelector).css("animation","");
                            if ($(LEDSelector).css("background-color") && $(LEDSelector).css("background-color") != "rgba(0, 0, 0, 0)") {
                                setOpacity($(LEDSelector), 1);
                            } else {
                                $(LEDSelector).show();
                            }
                        } else if (outputArray[2] == 0) {
                            //Turned off
                            $(LEDSelector).css("animation","");
                            if ($(LEDSelector).css("background-color") && $(LEDSelector).css("background-color") != "rgba(0, 0, 0, 0)") {
                                setOpacity($(LEDSelector), 0.4);
                            } else {
                                $(LEDSelector).hide();
                            }
                        } else {
                            //It's a flash - atm only the red ones actually have to flash
                            $(LEDSelector).css("animation","flashBackgroundRed " + (1/outputArray[2])*2 + "s linear infinite");
                        }
                    }
                    break;
                default:
                    break;
            }
    }
}
function sendMessageOSC(message) {
    return false;
}
$(document).ready(function () {
    $(".warningTriangle").fadeOut(function () {
        $("h6").fadeIn();
    });
    $("td[data-channel]").mousedown(function () {
        if ($(this).data("buttonpin")) {
            sendMessageOSC("BTNClick," + $(this).data("buttonpin"));
        } else if ($(this).hasClass("selector")) {
            if ($(this).data("channel") == "master") {
                setOpacity($(".selector[data-channel=master]"), 1);
                selectorQueue.forEach(function(entry) {
                    setOpacity($(".selector[data-channel=" + entry + "]"), 0.4);
                    $(".go[data-channel=" + entry + "]").trigger('mousedown');
                });
            } else if (selectorQueue.includes($(this).data("channel"))) {
                //remove element from queue
                for(var i = selectorQueue.length - 1; i >= 0; i--) {
                    if(selectorQueue[i] === $(this).data("channel")) {
                        selectorQueue.splice(i, 1);
                    }
                }

                setOpacity($(".selector[data-channel=" + $(this).data("channel") + "]"), 0.4);
            } else {
                selectorQueue.push($(this).data("channel"));
                setOpacity($(".selector[data-channel=" + $(this).data("channel") + "]"), 1);
            }
        }

    });
    $("td[data-channel]").mouseup(function () {
        if ($(this).data("buttonpin")) {
            sendMessageOSC("BTNUnClick," + $(this).data("buttonpin"));
        }   else if ($(this).hasClass("selector")) {
            if ($(this).data("channel") == "master") {
                selectorQueue.forEach(function (entry) {
                    $(".go[data-channel=" + entry + "]").trigger('mouseup');
                });
                selectorQueue = [];
                setOpacity($(".selector[data-channel=master]"), 0.4);
            }
        }


    });
});
