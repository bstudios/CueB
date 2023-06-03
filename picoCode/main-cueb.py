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
try:
    import socket
except ImportError:
    import usocket as socket
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

def attemptInitDHCP():
    global nic
    try:
        print("Attempting DHCP connection")
        nic.ifconfig('dhcp')
    except:
        print("Awaiting DHCP server")
        time.sleep(5)
        attemptInitDHCP()
  
attemptInitDHCP()

while not nic.isconnected():
    time.sleep(1)
    print("Awaiting connection")

deviceIp, deviceSubnet, deviceGateway, deviceDNS = nic.ifconfig()
print(deviceIp, deviceSubnet, deviceGateway, deviceDNS)

def getUniqueId():
    # This could be something a bit like the the mac address, the idea is its unique to a particular board
    try:
        return ubinascii.hexlify(machine.unique_id()).decode("utf-8")
    except:
        print("Error getting unique id")
        return 'ERRRR'
deviceUniqueId = getUniqueId()

'''
WebServer Paths
'''
defaultHeaders = {'Access-Control-Allow-Origin':'*', 'Cache-Control': 'no-cache, no-store, must-revalidate'}

@MicroWebSrv.route('/')
def handlerFuncGet(httpClient, httpResponse) :
    httpResponse.WriteResponseFile('homepage.html',
                                   contentType="text/html",
                                   headers=defaultHeaders )

@MicroWebSrv.route('/about')
def handlerFuncGet(httpClient, httpResponse) :
    config = configStore.getConfigDict()
    rtn = {
        'version': str(version),
        'config': config,
        'type': 'cueb',
        'uid': deviceUniqueId,
        'network': {
            'ip': deviceIp,
            'subnet': deviceSubnet,
            'gateway': deviceGateway,
            'dns': deviceDNS
        }
    }
    rtn['os'] = os.uname()
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "application/json",
                                contentCharset  = "UTF-8",
                                content         = json.dumps(rtn))

@MicroWebSrv.route('/reset')
def handlerFuncGet(httpClient, httpResponse) :
    configStore.deleteConfig()
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "application/json",
                                contentCharset  = "UTF-8",
                                content         = '{"success":true}')
    print("Deleted config - rebooting")
    sys.exit()

@MicroWebSrv.route('/set/config', 'POST')
def handlerFuncPost(httpClient, httpResponse):
    data = httpClient.ReadRequestPostedFormData()
    print(data)
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                            contentType     = "application/json",
                            contentCharset  = "UTF-8",
                            content         = "kk")

@MicroWebSrv.route('/set/config')
def handlerFuncGet(httpClient, httpResponse):
  content   = """\
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>TEST POST</title>
    </head>
    <body>
      <h1>TEST POST</h1>
      Firstname = %s<br />
      Lastname = %s<br />
    </body>
  </html>
  """ % ( MicroWebSrv.HTMLEscape(str("test")),
          MicroWebSrv.HTMLEscape(str("test2")))
  
  httpResponse.WriteResponseOk( headers         = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = content)
  

mws = MicroWebSrv([], port=80, bindIP='0.0.0.0', webPath="/flash/www")
mws.SetNotFoundPageUrl("/")
mws.Start(threaded=True) # Starts server in a new thread

#while True:
#    if (not nic.isconnected()):
#        print("Lost Network - rebooting")
#        sys.exit()
#    else:
#        time.sleep(1)

def newMessage(timetag, data):
    oscaddr, tags, args, src = data
    print(oscaddr)
    print(args)
    print(src)
    
    osc.send("/theatrechat/message/2", args[0], args[1])

MAX_DGRAM_SIZE = 1472
def run_server(saddr, port, handler=handle_osc):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    ai = socket.getaddrinfo(saddr, port)[0]
    sock.bind(ai[-1])
    print("Listening for OSC messages on %s:%i.", saddr, port)
    osc.send("/theatrechat/message/1", 'User10','test')
    try:
        while True:
            data, caddr = sock.recvfrom(MAX_DGRAM_SIZE)
            print("RECV %i bytes",
                                    len(data))
            print(caddr)
            handler(data, caddr, dispatch=newMessage)
    finally:
        sock.close()

osc = Client('192.168.1.255', int(27900))
run_server('0.0.0.0', int(27900))

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