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
from aswitch import Pushbutton, Delay_ms

import configStore

'''
CONFIG
'''
VERSION = '8.0.0'
# Buttons & LEDs - Pinout
BUTTONS = [{
                'pin': 12,
                'name': "OUTSTATION-STANDBY",
            },{
                'pin': 11,
                'name': "OUTSTATION-GO",
            }
        ]
LEDS = [{
                'pin': 10,
                'name': "OUTSTATION-STANDBY",
                'flashFrequency': 250,
            },{
                'pin': 13,
                'name': "OUTSTATION-GO",
                'flashFrequency': 250,
            },
            {
                'pin': 14,
                'name': "AMBER-STATUS",
                'flashFrequency': 250,
            },{
                'pin': 15,
                'name': "RED-STATUS",
                'flashFrequency': 250,
            }
        ]

'''
Program Begins
'''
print("[MAIN] Booting version", VERSION)


'''
Main State Logic
'''
state = 0
def translateState(stateInt):
    # Translates the state integer into a human readable string
    if (stateInt == 0):
        return "Error"
    elif (stateInt == 1):
        return "Ready"
    elif (stateInt == 2):
        return "Unacknowledged Standby"
    elif (stateInt == 3):
        return "Acknowledged Standby"
    elif (stateInt == 4):
        return "Unacknowledged Go"
    elif (stateInt == 5):
        return "Acknowledged Go"
    elif (stateInt == 6):
        return "Panic/Vegas"
    else:
        return "Unknown"

def setState(newState):
    global state
    state = newState
    if (newState == 1):
        LEDOff(getLEDIdByName("OUTSTATION-STANDBY"))
        LEDOff(getLEDIdByName("OUTSTATION-GO"))
    elif (newState == 2):
        LEDFlash(getLEDIdByName("OUTSTATION-STANDBY"))
        LEDOff(getLEDIdByName("OUTSTATION-GO"))
    elif (newState == 3):
        LEDOn(getLEDIdByName("OUTSTATION-STANDBY"))
        LEDOff(getLEDIdByName("OUTSTATION-GO"))
    elif (newState == 4):
        LEDOff(getLEDIdByName("OUTSTATION-STANDBY"))
        LEDFlash(getLEDIdByName("OUTSTATION-GO"))
    elif (newState == 5):
        LEDOff(getLEDIdByName("OUTSTATION-STANDBY"))
        LEDOn(getLEDIdByName("OUTSTATION-GO"))
    elif (newState == 6):
        LEDOn(getLEDIdByName("OUTSTATION-STANDBY"))
        LEDOn(getLEDIdByName("OUTSTATION-GO"))
    print("[STATE] State changed to", translateState(state))


'''
Setup Buttons & LEDs - Interrupts
'''
def buttonPress(data):
    if (data[0] == "OUTSTATION-STANDBY"):
        if (state == 2):
            setState(3)
    elif(data[0] == "OUTSTATION-GO"):
        if (state == 4):
            setState(5)

def buttonRelease(data):
    print("Button release", data)
def buttonLong(data):
    print("Button long", data)
def buttonDoubleClick(data):
    if (data[0] == "OUTSTATION-GO"):
        if (state == 6):
            setState(1)
        elif (state != 0):
            setState(6)

# https://github.com/peterhinch/micropython-async/blob/99421dcceefe8f039a1776bb1fc68f87ed085b91/v2/DRIVERS.md
for i in range(len(BUTTONS)):
    BUTTONS[i]['var'] = Pin(BUTTONS[i]['pin'], Pin.IN, Pin.PULL_UP)
    BUTTONS[i]['tracker'] = Pushbutton(pin=BUTTONS[i]['var'],suppress=True)
    BUTTONS[i]['tracker'].press_func(buttonPress, (BUTTONS[i]['name'],))
    BUTTONS[i]['tracker'].double_func(buttonDoubleClick, (BUTTONS[i]['name'],))
    BUTTONS[i]['tracker'].long_func(buttonLong, (BUTTONS[i]['name'],))
    BUTTONS[i]['tracker'].release_func(buttonRelease, (BUTTONS[i]['name'],))
    if (BUTTONS[i]['var'].value() == 1):
        BUTTONS[i]['status'] = True
    else:
        BUTTONS[i]['status'] = False

async def flashLEDRunner(ledid):
    while LEDS[ledid]['flash']:
        if (LEDS[ledid]['status']):
            LEDS[ledid]['status'] = False
            LEDS[ledid]['var'].low()
        else:
            LEDS[ledid]['status'] = True
            LEDS[ledid]['var'].high()
        await asyncio.sleep_ms(LEDS[ledid]['flashFrequency'])

def LEDFlash(ledid):
    LEDS[ledid]['flash'] = True
    asyncio.create_task(flashLEDRunner(ledid))

def LEDOn(ledid):
    LEDS[ledid]['flash'] = False
    LEDS[ledid]['status'] = True
    LEDS[ledid]['var'].high()

def LEDOff(ledid):
    LEDS[ledid]['flash'] = False
    LEDS[ledid]['status'] = False
    LEDS[ledid]['var'].low()

def getLEDIdByName(name):
    for i in range(len(LEDS)):
        if (LEDS[i]['name'] == name):
            return i
    raise Exception("LED not found")

for i in range(len(LEDS)):
    LEDS[i]['var'] = Pin(LEDS[i]['pin'], Pin.OUT)
    LEDS[i]['status'] = True
    LEDS[i]['flash'] = False
    LEDS[i]['var'].high()

'''
Init W5x00 chip
'''
spi=SPI(0,2_000_000, mosi=Pin(19),miso=Pin(16),sck=Pin(18))
nic = network.WIZNET5K(spi,Pin(17),Pin(20)) #spi,cs,reset pin
nic.active(True)

def reboot():
    print("[MAIN] Rebooting")
    machine.reset() # Hard reset equivalent to pulling the power
    #sys.exit() #Soft reset just rebooting the virtual machine

async def rebootAsync():
    print("[MAIN] Reboot is scheduled")
    await asyncio.sleep(3.0)
    reboot()

try:
    print("[NETWORK] Attempting DHCP connection")
    nic.ifconfig('dhcp')
except:
    print("[NETWORK] No DHCP, rebooting in 10s")
    time.sleep(10)
    reboot()

while not nic.isconnected():
    time.sleep(1)
    print("[NETWORK] Awaiting connection")

deviceIp, deviceSubnetMask, deviceGateway, deviceDnsServer = nic.ifconfig()
deviceRoutingPrefix = (".".join(map(str, [i & m
          for i,m in zip(map(int, deviceIp.split(".")),
                         map(int, deviceSubnetMask.split(".")))])))
deviceBroadcastAddress = (".".join(map(str,[(ioctet | ~moctet) & 0xff for ioctet, moctet in zip(tuple(map(int, deviceIp.split('.'))), tuple(map(int, deviceSubnetMask.split('.'))))])))

print("[NETWORK] Got IP " + str(deviceIp))

def getUniqueId():
    # This is something a bit like the the mac address, the idea is its unique to a particular board
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

@app.route('/favicon.ico')
async def route_style(request, response):
    # Seems a bit silly, but you have to have one otherwise each pageload makes a request to the homepage because of the catchall
    await response.send_file('assets/favicon.png',content_type="image/png",max_age=31536000)

@app.route('/rebooting')
async def route_reboot(request, response):
    await response.send_file('assets/rebooting.html',content_type="text/html",max_age=31536000)

@app.catchall()
async def route_404(request, response):
    await response.redirect('/')

deviceCpuTemp = machine.ADC(4)
def prepareConfigString():
    tempReading = deviceCpuTemp.read_u16() * (3.3 / 65535)
    temperature = 27 - (tempReading - 0.706)/0.001721
    rtn = {
        'version': str(VERSION),
        'type': 'cueb',
        'uid': deviceUniqueId,
        'stateString': translateState(state),
        'state': state,
        'network': {
            'ip': deviceIp,
            'subnetMask': deviceSubnetMask,
            'gateway': deviceGateway,
            'dnsServer': deviceDnsServer,
            'routingPrefix': deviceRoutingPrefix,
            'broadcastAddress': deviceBroadcastAddress
        },
        'cpuTempDegrees': temperature,
        'config': {},
    }
    rtn['os'] = str(os.uname())
    configData = configStore.getConfigStructureAndDefaults()
    for key in configData:
        rtn['config'][key] = {'value': configStore.getConfig(key), 'name': configData[key]['name']}
    return rtn

@app.route('/about')
async def route_about(request, response):
    rtn = json.dumps(prepareConfigString())
    page = """\
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <link rel="stylesheet" href="/style.css">
          <title>About Device</title>
        </head>
        <body style="text-align: left;">
            <a href="/" class="button" type="button" style="background-color: grey;">&lt; Back</a><br />
            <pre id="json">%s</pre>
            <script>
                document.getElementById("json").textContent = JSON.stringify(JSON.parse(document.getElementById("json").textContent), undefined, 4);
            </script>
        </body>
    </html>        
    """ % rtn
    await response.start_html()
    await response.send(page)

@app.route('/about.json')
async def route_aboutjson(request, response):
    rtn = json.dumps(prepareConfigString())
    response.add_header('Content-Type', 'application/json')
    await response._send_headers()
    await response.send(rtn)

def urldecode_query(s):
    """Decode urlencoded string (including '+' char).

    Returns decoded string
    """
    s = s.replace('+', ' ')
    arr = s.split('%')
    res = arr[0]
    for it in arr[1:]:
        if len(it) >= 2:
            res += chr(int(it[:2], 16)) + it[2:]
        elif len(it) == 0:
            res += '%'
        else:
            res += it
    return res

@app.route('/config')
async def route_config(request, response):
    changed = False
    if (len(request.query_string.decode()) > 0):
        formData = {}
        pairs = request.query_string.decode().split('&')
        for p in pairs:
            vals = [urldecode_query(x) for x in p.split('=', 1)]
            if len(vals) == 1:
                formData[vals[0]] = ''
            else:
                formData[vals[0]] = vals[1]
        
        print("[WEB] Recieved formdata", formData)
        for key,value in formData.items():
            if (str(configStore.getConfig(key)) != value):
                print("[WEB] Detected config changed for {0} from {1} to {2}".format(key, str(configStore.getConfig(key)), value))
                configStore.setConfig(str(key),str(value))
                changed = True
    
    if (changed):
        asyncio.create_task(rebootAsync())
        await response.redirect('/rebooting')
    else:
        content = """\
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <link rel="stylesheet" href="/style.css">
              <title>Settings</title>
            </head>
            <body>
                <h1>Settings</h1>
                <form method="GET">
                  <label>Device ID</label><br />
                  <input type="text" readonly value="%s" disabled><br />
          """ % str(deviceUniqueId)
        configStructure = configStore.getConfigStructureAndDefaults()
        for key in configStructure:
            content += """\
                <label>%s</label><br />
                <input type="text" name="%s" value="%s" required minlength="1"><br />
                """ % ( configStructure[key]['name'],
                        key,
                        str(configStore.getConfig(key)),
                )

        content += """\
            <br /><br /><input type="submit" value="Save & Reboot" class="button" style="background-color: green;">
                    </form>
                    <br /><br /><a href="/" class="button" type="button" style="background-color: grey;">&lt; Back</a><a href="/factoryReset" class="button" type="button" style="background-color: red;">Factory Reset</a>
                </body>
                </html>
        """
        await response.start_html()
        await response.send(content)

@app.route('/factoryReset')
async def route_reset(request, response):
    configStore.deleteConfig()
    asyncio.create_task(rebootAsync())
    await response.redirect('/rebooting')

app.run(host='0.0.0.0', port=80, loop_forever=False)

'''
OSC
'''

MAX_DGRAM_SIZE = 1472
async def oscServer(host, port, cb, **params):
    print("[OSC] Starting UDP server")
    ai = socket.getaddrinfo(host, port)[0]  # blocking!
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setblocking(False)
    sock.bind(ai[-1])

    p = select.poll()
    p.register(sock, select.POLLIN)
    poll = getattr(p, "ipoll", p.poll)

    print("[OSC] Entering polling loop...")
    setState(1)
    while True:
        try:
            for res in poll(1):
                if res[1] & (select.POLLERR | select.POLLHUP):
                    print("[OSC] UDPServer.serve: unexpected socket error.")
                    break
                elif res[1] & select.POLLIN:
                    buf, addr = sock.recvfrom(MAX_DGRAM_SIZE)
                    asyncio.create_task(cb(res[0], buf, addr, **params))
            await asyncio.sleep(0.0)
        except asyncio.CancelledError:
            print("[OSC] UDPServer.serve task cancelled.")
            break

    # Shutdown server
    sock.close()
    setState(0)
    print("[OSC] Server shutdown")


    

async def broadcastState():
    while True:
        await asyncio.sleep_ms(100)
        oscClient.send("/cueb/outstationstate", deviceUniqueId, "state")

async def sendMessage(text="None"):
    oscClient.send("/cueb/message/2", deviceUniqueId, text)

asyncio.create_task(broadcastState())

async def handle_request(sock, data, caddr, **params):
    handle_osc(data, caddr, **params)

'''
Function that handles receipt of an OSC message
'''
def oscMessageRecieved(timetag, data):
    oscaddr, tags, args, src = data
    
    print(oscaddr)
    print(tags)
    print(args)
    print(src)
    #asyncio.create_task(sendMessage(args[1]))

oscClient = Client(deviceBroadcastAddress, int(configStore.getConfig("osc-sendport")))

'''
    MAIN LOOP
'''

try:
    asyncio.run(oscServer(deviceRoutingPrefix, int(configStore.getConfig("osc-recieveport")), handle_request, dispatch=oscMessageRecieved))
except KeyboardInterrupt:
    setState(0)
    pass
'''
TODO
- Set LEDs
- Broadcast state all the time to keep clients in sync with the uid
- Reply with config/name etc when requested
'''