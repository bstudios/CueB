from microWebSrv import MicroWebSrv
from machine import Pin,SPI
import network
import rp2
import time
import sys
import configStore
import json

version = '8.0.0'
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
        nic.ifconfig('dhcp')
    except:
        print("Awaiting DHCP server")
        time.sleep(5)
        attemptInitDHCP()
  
attemptInitDHCP()

while not nic.isconnected():
    time.sleep(1)
    print("Awaiting connection")
    
print('IP address :', nic.ifconfig())

'''
WebServer Paths
'''
defaultHeaders = {'Access-Control-Allow-Origin':'*', 'Cache-Control': 'no-cache, no-store, must-revalidate'}

@MicroWebSrv.route('/')
def handlerFuncGet(httpClient, httpResponse) :
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = "CueB" )

@MicroWebSrv.route('/blink')
def handlerFuncGet(httpClient, httpResponse) :
    # Blink is used to identify the device
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = "CueB" )
    
@MicroWebSrv.route('/about')
def handlerFuncGet(httpClient, httpResponse) :
    config = configStore.getConfigDict()
    rtn = {
        'version': str(version),
        'config': config,
        'type': 'cueb'
    }
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


@MicroWebSrv.route('/setlight/<ledtoset>/<statustoset>/<flashfreq>')
def handlerFunc_1(httpClient, httpResponse, routeArgs):
  '''
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
  """ % ( MicroWebSrv.HTMLEscape(str(routeArgs['testid'])),
          MicroWebSrv.HTMLEscape(str(routeArgs['testpath'])))
  '''
  response = '{"success":false}'
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
  httpResponse.WriteResponseOk( headers         = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = response)
  

mws = MicroWebSrv([], port=80, bindIP='0.0.0.0', webPath="/flash/www")
mws.SetNotFoundPageUrl("/")
mws.Start(threaded=True) # Starts server in a new thread


while True:
    if (not nic.isconnected()):
        print("Lost Network - rebooting")
        sys.exit()
    else:
        time.sleep(1)
