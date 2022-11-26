from microWebSrv import MicroWebSrv
from machine import Pin,SPI
import network
import rp2
import time
import sys
import configStore
import json

version = '1.0.0'
print("Booting version", version)

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
Init WebServer
'''
defaultHeaders = {'Access-Control-Allow-Origin':'*', 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Server': 'test'}


@MicroWebSrv.route('/test/<testid>/<testpath>')
def handlerFunc_1(httpClient, httpResponse, routeArgs):
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
  httpResponse.WriteResponseOk( headers         = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = content )

@MicroWebSrv.route('/')
def handlerFuncGet(httpClient, httpResponse) :
    httpResponse.WriteResponseOk( headers       = defaultHeaders,
                                contentType     = "text/html",
                                contentCharset  = "UTF-8",
                                content         = "running" )

@MicroWebSrv.route('/about')
def handlerFuncGet(httpClient, httpResponse) :
    config = configStore.getConfigDict()
    rtn = {
        'version': str(version),
        'config': config
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

mws = MicroWebSrv([], port=80, bindIP='0.0.0.0', webPath="/flash/www")
mws.SetNotFoundPageUrl("/")
mws.Start(threaded=True) # Starts server in a new thread

while True:
    if (not nic.isconnected()):
        print("Lost Network - rebooting")
        sys.exit()
    else:
        time.sleep(1)
