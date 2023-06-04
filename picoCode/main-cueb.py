import sys
sys.path.append('libs/')
from machine import Pin,SPI,Timer
import machine
import ubinascii
import network
import rp2
import time
import json
import os
try:
    import asyncio
except ImportError:
    import uasyncio as asyncio
try:
    import socket
except ImportError:
    import usocket as socket
try:
    import select
except ImportError:
    import uselect as select
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

def aboutJSONRoute():
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
    rtn['os'] = str(os.uname())
    configData = configStore.getConfigStructureAndDefaults()
    for key in configData:
        rtn['config'][key] = {'value': configStore.getConfig(key), 'name': configData[key]['name']}
    return rtn

@MicroWebSrv.route('/about/json')
def handlerFuncGet(httpClient, httpResponse) :
    rtn = aboutJSONRoute()
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "application/json",
                                contentCharset  = "UTF-8",
                                content         = json.dumps(rtn))

@MicroWebSrv.route('/about')
def handlerFuncGet(httpClient, httpResponse) :
    aboutData = aboutJSONRoute()
    page = """\
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <link rel="stylesheet" href="/style.css">
          <title>About Device</title>
        </head>
        <body>
            <pre id="json">%s</pre>
            <script>
                document.getElementById("json").textContent = JSON.stringify(JSON.parse(document.getElementById("json").textContent), undefined, 4);
            </script>
        </body>
    </html>        
    """ % json.dumps(aboutData)
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = page)

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
print("Webserver Started")

'''
OSC
'''

MAX_DGRAM_SIZE = 1472
async def oscServer(host, port, cb, **params):
    # bind instance attributes to local vars
    interval = 0.0
    maxsize = MAX_DGRAM_SIZE
    timeout = 1

    print("Starting UDP server @ (%s, %s)", host, port)
    ai = socket.getaddrinfo(host, port)[0]  # blocking!
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setblocking(False)
    sock.bind(ai[-1])

    p = select.poll()
    p.register(sock, select.POLLIN)
    poll = getattr(p, "ipoll", p.poll)

    print("Entering polling loop...")
    while True:
        try:
            for res in poll(timeout):
                if res[1] & (select.POLLERR | select.POLLHUP):
                    print("UDPServer.serve: unexpected socket error.")
                    break
                elif res[1] & select.POLLIN:
                    buf, addr = sock.recvfrom(maxsize)
                    asyncio.create_task(cb(res[0], buf, addr, **params))
            await asyncio.sleep(interval)
        except asyncio.CancelledError:
            print("UDPServer.serve task cancelled.")
            break

    # Shutdown server
    sock.close()
    print("Bye!")

async def broadcastState(text="None"):
    oscClient.send("/theatrechat/message/2", deviceUniqueId, text)


async def handle_request(sock, data, caddr, **params):
    handle_osc(data, caddr, **params)

def oscMessageRecieved(timetag, data):
    oscaddr, tags, args, src = data
    print(oscaddr)
    print(tags)
    print(args)
    print(src)
    asyncio.create_task(broadcastState(args[1]))


oscClient = Client(deviceBroadcastAddress, int(configStore.getConfig("osc-sendport")))

try:
    asyncio.run(oscServer(deviceRoutingPrefix, int(configStore.getConfig("osc-recieveport")), handle_request, dispatch=oscMessageRecieved))
except KeyboardInterrupt:
    pass
'''
TODO
- Buttons with hardware interrupts
- Set LEDs
- Broadcast state all the time to keep clients in sync with the uid
- Reply with config/name etc when requested
'''

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