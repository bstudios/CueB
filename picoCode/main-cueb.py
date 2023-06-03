import sys
sys.path.append('libs/')
from microWebSrv import MicroWebSrv
from machine import Pin,SPI
import machine
import ubinascii
import network
import rp2
import time
import json
import os
import socket
import select
from uosc.server import handle_osc
from uosc.client import Client
import configStore

'''
CONFIG
'''
version = '8.0.0'


'''
Program Begins
'''
print("Booting version", version)

'''
Setup Buttons & LEDs
'''
buttons = [{
                'pin': 10,
                'name': "Test",
                'lastPressed': time.time(),
                'lastReleased': time.time(),
                'status': False
            },{
                'pin': 11,
                'name': "Test2",
                'lastPressed':time.time(),
                'lastReleased': time.time(),
                'status': False
            }
        ]
leds = [{
            'pin': 5,
            'name': "Test3",
            'flashFrequency': 0
        },{
            'pin': 13,
            'name': "Test3",
            'flashFrequency': 0
        }
    ]

for i in range(len(buttons)):
    buttons[i]['var'] = Pin(buttons[i]['pin'], Pin.IN, Pin.PULL_UP)
    if (buttons[i]['var'].value() == 1):
        buttons[i]['status'] = True
    else:
        buttons[i]['status'] = False

for i in range(len(leds)):
    leds[i]['var'] = Pin(leds[i]['pin'], Pin.OUT)
    leds[i]['var'].high()


'''
Init W5x00 chip
'''
spi=SPI(0,2_000_000, mosi=Pin(19),miso=Pin(16),sck=Pin(18))
nic = network.WIZNET5K(spi,Pin(17),Pin(20)) #spi,cs,reset pin
nic.active(True)

def reboot():
    print("Rebooting")
    machine.reset() # Hard reset equivalent to pulling the power
    #sys.exit() #Soft reset just rebooting the virtual machine

try:
    print("Attempting DHCP connection")
    nic.ifconfig('dhcp')
except:
    print("No DHCP, rebooting in 30s")
    time.sleep(30)
    reboot()

while not nic.isconnected():
    time.sleep(1)
    print("Awaiting connection")

deviceIp, deviceSubnetMask, deviceGateway, deviceDnsServer = nic.ifconfig()
deviceRoutingPrefix = (".".join(map(str, [i & m
          for i,m in zip(map(int, deviceIp.split(".")),
                         map(int, deviceSubnetMask.split(".")))])))
deviceBroadcastAddress = (".".join(map(str,[(ioctet | ~moctet) & 0xff for ioctet, moctet in zip(tuple(map(int, deviceIp.split('.'))), tuple(map(int, deviceSubnetMask.split('.'))))])))

print("Booted with IP " + str(deviceIp))

def getUniqueId():
    # This could be something a bit like the the mac address, the idea is its unique to a particular board
    try:
        return ubinascii.hexlify(machine.unique_id()).decode("utf-8")
    except:
        print("Error getting unique id")
        return 'ERRRR'
deviceUniqueId = getUniqueId()



'''
WebServer
'''
defaultHeaders = {'Access-Control-Allow-Origin':'*', 'Cache-Control': 'no-cache, no-store, must-revalidate'}

@MicroWebSrv.route('/')
def handlerFuncGet(httpClient, httpResponse) :
    httpResponse.WriteResponseFile('assets/homepage.html',
                                   contentType="text/html",
                                   headers=defaultHeaders )
@MicroWebSrv.route('/style.css')
def handlerFuncGet(httpClient, httpResponse) :
    httpResponse.WriteResponseFile('assets/style.css',
                                   contentType="text/css",
                                   headers=defaultHeaders )

@MicroWebSrv.route('/about')
def handlerFuncGet(httpClient, httpResponse) :
    rtn = {
        'version': str(version),
        'type': 'cueb',
        'uid': deviceUniqueId,
        'network': {
            'ip': deviceIp,
            'subnetMask': deviceSubnetMask,
            'gateway': deviceGateway,
            'dnsServer': deviceDnsServer,
            'routingPrefix': deviceRoutingPrefix,
            'broadcastAddress': deviceBroadcastAddress
        },
        'config': {}
    }
    rtn['os'] = os.uname()
    configData = configStore.getConfigStructureAndDefaults()
    for key in configData:
        rtn['config'][key] = {'value': configStore.getConfig(key), 'name': configData[key]['name']}
    
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "application/json",
                                contentCharset  = "UTF-8",
                                content         = json.dumps(rtn))

@MicroWebSrv.route('/set/reset')
def handlerFuncGet(httpClient, httpResponse) :
    configStore.deleteConfig()
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "application/json",
                                contentCharset  = "UTF-8",
                                content         = '{"success":true}')
    print("Deleted config - rebooting")
    reboot()

@MicroWebSrv.route('/set/config', 'POST')
def handlerFuncPost(httpClient, httpResponse):
    data = httpClient.ReadRequestPostedFormData()
    for key in data:
        configStore.setConfig(MicroWebSrv.HTMLEscape(str(key)),MicroWebSrv.HTMLEscape(str(data[key])))
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                            contentType     = "text/html",
                            contentCharset  = "UTF-8",
                            content         = "Saved, device now rebooting. <a href=\"/\">Reload</a>")
    print("Deleted config - rebooting")
    reboot()

@MicroWebSrv.route('/set/config')
def handlerFuncGet(httpClient, httpResponse):
  content   = """\
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <link rel="stylesheet" href="/style.css">
      <title>Settings</title>
    </head>
    <body>
        <h1>Settings</h1>
        <form method="POST">
          <label>Device ID</label><br />
          <input type="text" readonly value="%s" disabled><br />
  """ % MicroWebSrv.HTMLEscape(str(deviceUniqueId))

  configStructure = configStore.getConfigStructureAndDefaults()
  for key in configStructure:
      content += """\
            <label>%s</label><br />
            <input type="text" name="%s" value="%s" required minlength="1"><br />
         """ % ( configStructure[key]['name'],
                 key,
                 MicroWebSrv.HTMLEscape(str(configStore.getConfig(key))),
            )
  
  content += """\
        <br /><br /><input type="submit" value="Save & Reboot" class="button" style="background-color: green;">
                </form>
                <br /><br /><a href="/" class="button" type="button" style="background-color: grey;">&lt; Back</a><a href="/set/reset" class="button" type="button" style="background-color: red;">Factory Reset</a>
            </body>
          </html>
    """
  httpResponse.WriteResponseOk( headers         = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = content)

mws = MicroWebSrv([], port=80, bindIP='0.0.0.0', webPath="/flash/www")
mws.SetNotFoundPageUrl("/")
mws.Start(threaded=True) # Starts server in a new thread

'''
OSC
'''

lastBroadcast = time.ticks_ms()
def broadcastState():
    global lastBroadcast
    if (time.ticks_diff(time.ticks_ms(), lastBroadcast) > 100):
        osc.send("/cueb/device/state", deviceUniqueId, configStore.getConfig("name"))
        print(time.time())
        lastBroadcast = time.ticks_ms()

def oscMessageRecieved(timetag, data):
    oscaddr, tags, args, src = data
    print(oscaddr)
    print(tags)
    print(args)
    print(src)
    
    osc.send("/theatrechat/message/2", args[0], args[1])
    
'''
Main Loop
'''

MAX_DGRAM_SIZE = 1472
def run_server(saddr, port, handler=handle_osc):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    ai = socket.getaddrinfo(saddr, port)[0]
    sock.setblocking(False)
    sock.bind(ai[-1])
    print("Listening for OSC messages on %s:%i.", saddr, port)
    osc.send("/theatrechat/message/1", 'User10','test')
    try:
        while True:
            data, caddr = sock.recvfrom(MAX_DGRAM_SIZE)
            print("RECV %i bytes",
                                    len(data))
            print(caddr)
            handler(data, caddr, dispatch=oscMessageRecieved)
    finally:
        sock.close()

osc = Client(deviceBroadcastAddress, int(configStore.getConfig("osc-sendport")))
run_server(deviceRoutingPrefix, int(configStore.getConfig("osc-recieveport")))

'''
for i in range(len(leds)):
    if (leds[i]['name'] == str(routeArgs['ledtoset'])):
        if (str(routeArgs['statustoset']) == 'on' and str(routeArgs['flashfreq']) == '0'):
            leds[i]['var'].high()
        elif (str(routeArgs['statustoset']) == 'off' and str(routeArgs['flashfreq']) == '0'):
            leds[i]['var'].low()
        elif (str(routeArgs['statustoset']) == 'flash'):
            # Flash
            leds[i]['var'].low()
        else:
            break
        response = '{"success":true}'
        break
'''