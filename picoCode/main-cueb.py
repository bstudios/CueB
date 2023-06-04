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

import tinyweb

# Create web server application
app = tinyweb.webserver(request_timeout=3, max_concurrency=1)


# Index page
@app.route('/')
async def route_index(request, response):
    await response.send_file('assets/homepage.html',content_type="text/html",max_age=31536000)

@app.route('/style.css')
async def route_style(request, response):
    await response.send_file('assets/style.css',content_type="text/css",max_age=31536000)

@app.catchall()
async def route_404(request, response):
    await response.redirect('/')

deviceCpuTemp = machine.ADC(4)
@app.route('/about')
async def route_about(request, response):
    tempReading = deviceCpuTemp.read_u16() * (3.3 / 65535)
    temperature = 27 - (tempReading - 0.706)/0.001721
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
        'cpuTempDegrees': temperature,
        'config': {}
    }
    rtn['os'] = str(os.uname())
    configData = configStore.getConfigStructureAndDefaults()
    for key in configData:
        rtn['config'][key] = {'value': configStore.getConfig(key), 'name': configData[key]['name']}
    rtn = json.dumps(rtn)

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
    """ % rtn
    await response.start_html()
    await response.send(page)

app.run(host='0.0.0.0', port=80, loop_forever=False)

'''
OSC
'''

MAX_DGRAM_SIZE = 1472
async def oscServer(host, port, cb, **params):
    print("Starting UDP server")
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
            for res in poll(1):
                if res[1] & (select.POLLERR | select.POLLHUP):
                    print("UDPServer.serve: unexpected socket error.")
                    break
                elif res[1] & select.POLLIN:
                    buf, addr = sock.recvfrom(MAX_DGRAM_SIZE)
                    asyncio.create_task(cb(res[0], buf, addr, **params))
            await asyncio.sleep(0.0)
        except asyncio.CancelledError:
            print("UDPServer.serve task cancelled.")
            break

    # Shutdown server
    sock.close()
    print("UDPServer shutdown")

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