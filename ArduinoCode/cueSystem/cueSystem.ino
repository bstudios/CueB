//  CONFIG
const String currentVersion = "Version 4.0";
//      BUTTONS
// IMPORTS FOR TEMPERATURE SENSOR
#include <Wire.h>
#include <Adafruit_HTU21DF.h>

//  IMPORTS FOR SCREEN
#include <LiquidCrystal_I2C.h> //Include the exact library in a zip that's included with this project source
#include <EEPROM.h>

#include <string.h>


//  CONFIG
const String buttonDetails(byte buttonID) {
  switch (buttonID) {
    case 0:
      //Don't forget 16 char limit!
      return "Facepanel - Up";
      break;
    case 1:
      return "Facepanel - Entr";
      break;
    case 2:
      return "Facepanel - Down";
      break;
    //    CONTROL PANEL GO/STANDBY BUTTONS - ALL MATCH UP WITH THEIR RESPECTIVE LED NUMBERS FOR EASE OF USEMer
    case 3:
      return "1 Standby";
      break;
    case 4:
      return "1 Go";
      break;
    case 5:
      return "2 Standby";
      break;
    case 6:
      return "2 Go";
      break;
    case 7:
      return "3 Standby";
      break;
    case 8:
      return "3 Go";
      break;
    case 9:
      return "4 Standby";
      break;
    case 10:
      return "4 Go";
      break;
    case 11:
      return "Master Go";
      break;
    //    OUTSTATIONS
    case 12:
      return "Outstation 1 ACK";
      break;
    case 13:
      return "Outstation 2 ACK";
      break;
    case 14:
      return "Outstation 3 ACK";
      break;
    case 15:
      return "Outstation 4 ACK";
      break;
    case 16:
      return "Outstation 1 Key";
      break;
    case 17:
      return "Outstation 1 Btn3";
      break;
    case 18:
      return "Outstation 2 Key";
      break;
    case 19:
      return "Outstation 2 Btn3";
      break;
    case 20:
      return "Outstation 3 Key";
      break;
    case 21:
      return "Outstation 3 Btn3";
      break;
    case 22:
      return "Outstation 4 Key";
      break;
    case 23:
      return "Outstation 4 Btn3";
      break;
    case 24:
      return "Outstation 1 Go";
      break;
    case 25:
      return "Outstation 2 Go";
      break;
    case 26:
      return "Outstation 3 Go";
      break;
    case 27:
      return "Outstation 4 Go";
      break;
    case 28:
      return "Master Standby";
      break;
  }
}
const String buttonDetailsCoded(byte buttonID) {
  switch (buttonID) {
    case 0:
      //Don't forget 16 char limit!
      return "0,0";
      break;
    case 1:
      return "0,1";
      break;
    case 2:
      return "0,2";
      break;
    case 3:
      return "0,3";
      break;
    case 4:
      return "0,4";
      break;
    case 5:
      return "0,5";
      break;
    case 6:
      return "0,6";
      break;
    case 7:
      return "0,7";
      break;
    case 8:
      return "0,8";
      break;
    case 9:
      return "0,9";
      break;
    case 10:
      return "0,10";
      break;
    case 11:
      return "0,11";
      break;
    case 28:
      return "0,28";
      break;
    //    OUTSTATIONS
    case 12:
      return "1,2";
      break;
    case 13:
      return "2,2";
      break;
    case 14:
      return "3,2";
      break;
    case 15:
      return "4,2";
      break;
    case 16:
      return "1,4";
      break;
    case 17:
      return "1,5";
      break;
    case 18:
      return "2,4";
      break;
    case 19:
      return "2,5";
      break;
    case 20:
      return "3,4";
      break;
    case 21:
      return "3,5";
      break;
    case 22:
      return "4,4";
      break;
    case 23:
      return "4,5";
      break;
    case 24:
      return "1,3";
      break;
    case 25:
      return "2,3";
      break;
    case 26:
      return "3,3";
      break;
    case 27:
      return "4,3";
      break;
  }
}
const byte buttonsCount = 29; //The number of buttons currently in existence
//      LEDS
/* LED List
    0 = Power indicator
    1 = Green LED indicator
    2 = Blue LED indicator
        CONTROL PANEL GO/STANDBY BUTTONS - ALL MATCH UP WITH THEIR RESPECTIVE BUTTON NUMBERS FOR EASE OF USE
    3 = 1 Standby
    4 = 1 Go
    5 = 2 Standby
    6 = 2 Go
    7 = 3 Standby
    8 = 3 Go
    9 = 4 Standby
    10 = 4 Go
    11 = Master Go
        EXTRA CONTROL PANEL INDICATORS+
    12 = 1 - Emergency Stop indicator
    13 = 1 - Blue Key Switch indicator
    14 = 2 - Emergency Stop indicator
    15 = 2 - Blue Key Switch indicator
    16 = 3 - Emergency Stop indicator
    17 = 3 - Blue Key Switch indicator
    18 = 4 - Emergency Stop indicator
    19 = 4 - Blue Key Switch indicator
        OUTSTATIONS
    20 = 1 Standby
    21 = 1 Go
    22 = 1 Warning
    23 = 2 Standby
    24 = 2 Go
    25 = 2 Warning
    26 = 3 Standby
    27 = 3 Go
    28 = 3 Warning
    29 = 4 Standby
    30 = 4 Go
    31 = 4 Warning
        OTHER
    32 = Master Standby
*/
const byte ledCount = 33; //The number of buttons currently in existence
/*  Setup Guide for "cueOutstationPins"
   0 BTN Facepanel Standby
   1 BTN Facepanel Go
   2 BTN Outstation Acknowledge
   3 BTN Outstation Go (if fitted)
   4 BTN Outstation Swtich (if fitted)
   5 BTN Outstation 3rd Button (if fitted)
   6 LED Facepanel Standby
   7 LED Facepanel Go
   8 LED Facepanel Emergency Stop indicator (if fitted)
   9 LED Facepanel Key switch indicator (if fitted)
   10 LED Outstation Standby
   11 LED Outstation Go
   12 LED Outstation Warning
*/
const unsigned int cueOutstationCount = 4;
const unsigned int cueOutstationPins0[] = {3, 4, 12, 24, 16, 17, 3, 4, 12, 13, 20, 21, 22};
const unsigned int cueOutstationPins1[] = {5, 6, 13, 25, 18, 19, 5, 6, 14, 15, 23, 24, 25};
const unsigned int cueOutstationPins2[] = {7, 8, 14, 26, 20, 21, 7, 8, 16, 17, 26, 27, 28};
const unsigned int cueOutstationPins3[] = {9, 10, 15, 27, 22, 23, 9, 10, 18, 19, 29, 30, 31};


#include "config.h"

#if NETWORKED
  constexpr uint16_t port = 80;
  //Ethernet Element
  #include <WebSocketServer.h> //github.com/skaarj1989/mWebSockets
  #include <SPI.h>
  #include <Ethernet.h>
  using namespace net;
  IPAddress ip( 192, 168, 1, 3 );
  WebSocketServer wss(port);
#endif 
void serialBroadcast(String text) {
  Serial.println(text);
  #if NETWORKED
    const char * message = text.c_str();
    wss.broadcast(WebSocket::DataType::TEXT, message, strlen(message));
  #endif
}
//  SETUP
//      BUTTONS
unsigned long buttonsLastDebounceTime[buttonsCount]; //The last time each button was pressed
unsigned long buttonsHeldTime[buttonsCount]; //How long button has been held for
int buttonsState[buttonsCount];
int buttonsLastState[buttonsCount];
//      LEDs
unsigned int ledFlashingFrequency[ledCount]; //How many Hz is this LED flashing at? 0 = not flashing
unsigned long ledFlashingLastChangeTime[ledCount]; //When did this LED last change state?
//      MENU
/* MenuMode List
    0 = Menu not open - screen can do as it pleases
    1 = Menu level 1 - "master menu" for selecting mode and settings
    2 = About
    3 = Settings
*/
unsigned int menuMode = 0; //Menu Mode
unsigned int menuTier = 0; //Menu Sub tier
//      CUE LOGIC
unsigned int cueChannelState[cueOutstationCount];
/* States
    0 All leds off - nothing happening
    1 Standby sent
    2 Standby acknowledged - waiting for go
    3 Go
    4 Master go sent
    5 Standby sent automatically
    7 Auto standby ack
    8 Auto go sent
    9 Master standby sent
    10 Callback (panic type thing) sent
    11 ---
*/

//  FUNCTIONS
//      GENERAL
void(* rebootArduino) (void) = 0;  // Reboot arudino https://arduino.stackexchange.com/a/1478
String serialInDataBuffer;
//      BUTTONS
//      SCREEN

LiquidCrystal_I2C lcd(0x3F, lcdPins[0], lcdPins[1], lcdPins[2], lcdPins[3], lcdPins[4], lcdPins[5], lcdPins[6], lcdPins[7], POSITIVE); //Be sure to run this screen at 5V - it's rubbish at 3.3V
bool lcdFitted = false;
bool writeToScreen(String text, int line) {
  if (lcdFitted) {
    if (line == 1) {
      lcd.setCursor(0, 0);
      lcd.print("                "); //Clear that line of the display
      lcd.setCursor(0, 0);
    } else if (line == 2) {
      lcd.setCursor(0, 1);
      lcd.print("                "); //Clear that line of the display
      lcd.setCursor(0, 1);
    } else {
      text = " LINE SET WRONG ";
    }

    if (text.length() > 16) { //If string too long for system print an error
      text = "STRING TOO LONG ";
    }


    //
    lcd.print(text);
  }
}
//      BUTTONS
//        Check state of all the buttons and update their debounce timers accordingly


void loopCheckStateOfButtons() {
  int i;
  for (i = 0; i < buttonsCount; i = i + 1) {
    if (buttonsPins[i] == 255) { //Not fitted to this device
      continue;
    }
    //Handle the debouncing stuff for that button
    if (digitalRead(buttonsPins[i]) != buttonsLastState[i]) {
      buttonsLastDebounceTime[i] = millis(); // reset the debouncing timer for that particular button
      buttonsLastState[i] = digitalRead(buttonsPins[i]);
    }

    //Handle if it's actually been pressed for that button
    if ((millis() - buttonsLastDebounceTime[i]) > buttonsDebounceDelay && digitalRead(buttonsPins[i]) != buttonsState[i]) {
      if (digitalRead(buttonsPins[i]) == buttonsDownState[i]) {
        buttonPressed(i); //Call a function if it's been pressed
        buttonsHeldTime[i] = millis(); //Track when it was pressed - so we can give an indication to the release function of how long it was held for
      } else {
        buttonReleased(i, (millis() - buttonsHeldTime[i])); //Call a function if it's been released
      }
      buttonsState[i] = digitalRead(buttonsPins[i]);
    }
  }
}
// Function called when a button is released - it's expected this won't normally be used
void buttonReleased(int i, unsigned long holdTime) { //holdTime is how long the button was held for before being released in Milliseconds
  serialBroadcast(String("BTNRelease,")+buttonDetailsCoded(i)+","+holdTime+"");
  if (pushToGoOff != true) {
    //Their system is using push to go so if this is a go button that's illuminated it should be turned off as they release it
    if (i == 11 and (cueChannelState[0] == 4 or cueChannelState[1] == 4 or cueChannelState[2] == 4 or cueChannelState[3] == 4)) {
      //If a master go has been used
      ledOff(11); //Turn off master Go light
      ledOff(32); //Turn off master standby 
      //Turn all the lights off
      cueChannelState[0] = 0;
      ledOff(cueOutstationPins0[6]);
      ledOff(cueOutstationPins0[7]);
      ledOff(cueOutstationPins0[10]);
      ledOff(cueOutstationPins0[11]);
      cueChannelState[1] = 0;
      ledOff(cueOutstationPins1[6]);
      ledOff(cueOutstationPins1[7]);
      ledOff(cueOutstationPins1[10]);
      ledOff(cueOutstationPins1[11]);
      cueChannelState[2] = 0;
      ledOff(cueOutstationPins2[6]);
      ledOff(cueOutstationPins2[7]);
      ledOff(cueOutstationPins2[10]);
      ledOff(cueOutstationPins2[11]);
      cueChannelState[3] = 0;
      ledOff(cueOutstationPins3[6]);
      ledOff(cueOutstationPins3[7]);
      ledOff(cueOutstationPins3[10]);
      ledOff(cueOutstationPins3[11]);
    }
    if (cueChannelState[0] == 3 and i == cueOutstationPins0[1]) {
      //Turn off Channel 0 as Go has been released
      cueChannelState[0] = 0;
      ledOff(cueOutstationPins0[6]);
      ledOff(cueOutstationPins0[7]);
      ledOff(cueOutstationPins0[10]);
      ledOff(cueOutstationPins0[11]);
    }
    if (cueChannelState[1] == 3 and i == cueOutstationPins1[1]) {
      //Turn off Channel 1 as Go has been released
      cueChannelState[1] = 0;
      ledOff(cueOutstationPins1[6]);
      ledOff(cueOutstationPins1[7]);
      ledOff(cueOutstationPins1[10]);
      ledOff(cueOutstationPins1[11]);
    }
    if (cueChannelState[2] == 3 and i == cueOutstationPins2[1]) {
      //Turn off Channel 2 as Go has been released
      cueChannelState[2] = 0;
      ledOff(cueOutstationPins2[6]);
      ledOff(cueOutstationPins2[7]);
      ledOff(cueOutstationPins2[10]);
      ledOff(cueOutstationPins2[11]);
    }
    if (cueChannelState[3] == 3 and i == cueOutstationPins3[1]) {
      //Turn off Channel 3 as Go has been released
      cueChannelState[3] = 0;
      ledOff(cueOutstationPins3[6]);
      ledOff(cueOutstationPins3[7]);
      ledOff(cueOutstationPins3[10]);
      ledOff(cueOutstationPins3[11]);
    }
  }

  if (i == cueOutstationPins0[5]) {
    //3rd button
    ledOn(cueOutstationPins0[8]);
  } else if (i == cueOutstationPins0[4]) {
    //Key switch
    ledOn(cueOutstationPins0[9]);
  }
  if (i == cueOutstationPins1[5]) {
    //3rd button
    ledOn(cueOutstationPins1[8]);
  } else if (i == cueOutstationPins1[4]) {
    //Key switch
    ledOn(cueOutstationPins1[9]);
  }
  if (i == cueOutstationPins2[5]) {
    //3rd button
    ledOn(cueOutstationPins2[8]);
  } else if (i == cueOutstationPins2[4]) {
    //Key switch
    ledOn(cueOutstationPins2[9]);
  }
  if (i == cueOutstationPins3[5]) {
    //3rd button
    ledOn(cueOutstationPins3[8]);
  } else if (i == cueOutstationPins3[4]) {
    //Key switch
    ledOn(cueOutstationPins3[9]);
  }

}
// Function called when a button is pressed
void buttonPressed(int i) {
  serialBroadcast(String("BTNPress,")+buttonDetailsCoded(i));
  switch (i) {
    case 1: //Enter
      if (menuMode == 0) {
        menuMode = 1;
        writeToScreen("MENU", 1);
        writeToScreen("Exit Menu", 2);
      } else if (menuMode == 1 && menuTier == 0) {
        //Exit menu
        menuMode = 0;
        writeToScreen("      CueB      ", 1);
        writeToScreen("****************", 2);
      } else if (menuMode == 1 && menuTier == 1) {
        menuMode = 0;
        menuTier = 0;
        //Show about screen
        writeToScreen("CueB Cue Lights3", 1);
        writeToScreen(currentVersion, 2);
      } else if (menuMode == 1 && menuTier == 2) {
        menuMode = 3;
        menuTier = 1;
        //Show settings menu
        writeToScreen("MENU -> SETTINGS", 1);
        writeToScreen("Backlight toggle", 2);
      } else if (menuMode == 2) {
        menuMode = 0;
        writeToScreen("MENU", 1);
        writeToScreen("Exit Menu", 2);
      } else if (menuMode == 3) {
        if (menuTier == 0) {
          //Exit menu
          menuMode = 0;
          writeToScreen("      CueB      ", 1);
          writeToScreen("****************", 2);
        } else if (menuTier == 1) {
          if (EEPROM.read(0) == 1) {
            //When byte 0 = 1 the backlight is OFF (to make on the Default)
            lcd.setBacklight(HIGH);
            EEPROM.write(0, 0);
          } else {
            lcd.setBacklight(LOW);
            EEPROM.write(0, 1);
          }
        }  else if (menuTier == 2) {
          //Run a full IO test
          writeToScreen("IO and LEDs TEST", 1);
          writeToScreen(" NO BTN PRESSED ", 2);
          //  Turn on all LEDs
          for (i = 0; i < ledCount; i = i + 1) {
            ledOn(i);
          }
          delay(1000); //Because otherwise it'll pick up the enter key being pressed to get onto this page
          //  Show on screen any button that might get pressed
          while (true) {
            for (i = 0; i < buttonsCount; i = i + 1) {
              if (digitalRead(buttonsPins[i]) == buttonsDownState[i]) {
                writeToScreen(buttonDetails(i), 2);
              }
            }
          }
          //They need to reboot manually to get out of this facility
        }  else if (menuTier == 3) {
          //EPROM clear function https://www.arduino.cc/en/Tutorial/EEPROMClear - clear all the internal storage back to default
          writeToScreen("      CueB      ", 1);
          writeToScreen(" RESET RUNNING *", 2);
          for (int i = 0 ; i < EEPROM.length() ; i++) {
            EEPROM.write(i, 0);
          }
          rebootArduino();
        }
        //Show settings menu

      } else if (menuMode == 3 && menuTier == 1) {
        menuTier = 1;
        //Show settings menu
        writeToScreen("Settings item 2", 2);
      }
      break;
    case 0: //Up
      if (menuMode == 1) {
        if (menuTier == 1) {
          menuTier = 0;
          writeToScreen("Exit Menu", 2);
        } else if (menuTier == 2) {
          menuTier = 1;
          writeToScreen("About", 2);
        }
      } else if (menuMode == 3) {
        if (menuTier == 1) {
          menuTier = 0;
          writeToScreen("Exit Menu", 2);
        }  else if (menuTier == 2) {
          menuTier = 1;
          writeToScreen("Backlight toggle", 2);
        }   else if (menuTier == 3) {
          menuTier = 2;
          writeToScreen("IO & LED Test", 2);
        }
      }
      break;
    case 2: //Down
      if (menuMode == 1) {
        if (menuTier == 0) {
          menuTier = 1;
          writeToScreen("About", 2);
        } else if (menuTier == 1) {
          menuTier = 2;
          writeToScreen("Settings", 2);
        }
      } else if (menuMode == 3) {
        if (menuTier == 0) {
          menuTier = 1;
          writeToScreen("Backlight toggle", 2);
        } else if (menuTier == 1) {
          menuTier = 2;
          writeToScreen("IO & LED Test", 2);
        }  else if (menuTier == 2) {
          menuTier = 3;
          writeToScreen("Factory Reset", 2);
        }
      }
      break;

  }

  //Buttons - primary cue logic - channel 0
  if (i == cueOutstationPins0[0]) {
    channelStandbyButton(0, cueOutstationPins0);
  } else if (i == cueOutstationPins0[2]) {
    channelAckButton(0, cueOutstationPins0);
  } else if (i == cueOutstationPins0[3]) {
    channelOutstationGoButton(0, cueOutstationPins0);
  } else if (i == cueOutstationPins0[1]) {
    channelGoButton(0, cueOutstationPins0);
  }

  //Buttons - primary cue logic - channel 1
  if (i == cueOutstationPins1[0]) {
    channelStandbyButton(1, cueOutstationPins1);
  } else if (i == cueOutstationPins1[2]) {
    channelAckButton(1, cueOutstationPins1);
  } else if (i == cueOutstationPins1[3]) {
    channelOutstationGoButton(1, cueOutstationPins1);
  } else if (i == cueOutstationPins1[1]) {
    channelGoButton(1, cueOutstationPins1);
  }

  //Buttons - primary cue logic - channel 2
  if (i == cueOutstationPins2[0]) {
    channelStandbyButton(2, cueOutstationPins2);
  } else if (i == cueOutstationPins2[2]) {
    channelAckButton(2, cueOutstationPins2);
  } else if (i == cueOutstationPins2[3]) {
    channelOutstationGoButton(2, cueOutstationPins2);
  } else if (i == cueOutstationPins2[1]) {
    channelGoButton(2, cueOutstationPins2);
  }

  //Buttons - primary cue logic - channel 3
  if (i == cueOutstationPins3[0]) {
    channelStandbyButton(3, cueOutstationPins3);
  } else if (i == cueOutstationPins3[2]) {
    channelAckButton(3, cueOutstationPins3);
  } else if (i == cueOutstationPins3[3]) {
    channelOutstationGoButton(3, cueOutstationPins3);
  } else if (i == cueOutstationPins3[1]) {
    channelGoButton(3, cueOutstationPins3);
  }

  if (i == cueOutstationPins0[5]) {
    //3rd button
    ledOff(cueOutstationPins0[8]);
  } else if (i == cueOutstationPins0[4]) {
    //Key switch
    ledOff(cueOutstationPins0[9]);
  }
  if (i == cueOutstationPins1[5]) {
    //3rd button
    ledOff(cueOutstationPins1[8]);
  } else if (i == cueOutstationPins1[4]) {
    //Key switch
    ledOff(cueOutstationPins1[9]);
  }
  if (i == cueOutstationPins2[5]) {
    //3rd button
    ledOff(cueOutstationPins2[8]);
  } else if (i == cueOutstationPins2[4]) {
    //Key switch
    ledOff(cueOutstationPins2[9]);
  }
  if (i == cueOutstationPins3[5]) {
    //3rd button
    ledOff(cueOutstationPins3[8]);
  } else if (i == cueOutstationPins3[4]) {
    //Key switch
    ledOff(cueOutstationPins3[9]);
  }

  if (i == 28) {
    //Master standby pressed
    if (cueChannelState[0] == 9 or cueChannelState[1] == 9 or cueChannelState[2] == 9  or cueChannelState[3] == 9) {
      //Cancel a master standby
      for (int i = 0; i <= 3; i++) {
        cueChannelState[i] = 0;
      }
      ledOff(cueOutstationPins0[6]);
      ledOff(cueOutstationPins0[10]);
      ledOff(cueOutstationPins1[6]);
      ledOff(cueOutstationPins1[10]);
      ledOff(cueOutstationPins2[6]);
      ledOff(cueOutstationPins2[10]);
      ledOff(cueOutstationPins3[6]);
      ledOff(cueOutstationPins3[10]);
      ledOff(cueOutstationPins0[7]);
      ledOff(cueOutstationPins0[11]);
      ledOff(cueOutstationPins1[7]);
      ledOff(cueOutstationPins1[11]);
      ledOff(cueOutstationPins2[7]);
      ledOff(cueOutstationPins2[11]);
      ledOff(cueOutstationPins3[7]);
      ledOff(cueOutstationPins3[11]);
      ledOff(11);
      ledOff(32);
    } else {
      //Trigger a master standby
      for (int i = 0; i <= 3; i++) {
        cueChannelState[i] = 9;
      }
      ledFlash(cueOutstationPins0[6], ledFacepanelFrequencyStandby);
      ledFlash(cueOutstationPins0[10], ledOutstationFrequencyStandby);
      ledOff(cueOutstationPins0[7]);
      ledOff(cueOutstationPins0[11]);
      ledFlash(cueOutstationPins1[6], ledFacepanelFrequencyStandby);
      ledFlash(cueOutstationPins1[10], ledOutstationFrequencyStandby);
      ledOff(cueOutstationPins1[7]);
      ledOff(cueOutstationPins1[11]);
      ledFlash(cueOutstationPins2[6], ledFacepanelFrequencyStandby);
      ledFlash(cueOutstationPins2[10], ledOutstationFrequencyStandby);
      ledOff(cueOutstationPins2[7]);
      ledOff(cueOutstationPins2[11]);
      ledFlash(cueOutstationPins3[6], ledFacepanelFrequencyStandby);
      ledFlash(cueOutstationPins3[10], ledOutstationFrequencyStandby);
      ledOff(cueOutstationPins3[7]);
      ledOff(cueOutstationPins3[11]);
      
      ledOff(11); //Master go light
      ledFlash(32, ledFacepanelFrequencyStandby);
      
    }
  }
  if (i == 11) {
    //Master go pressed
    if (pushToGoOff and (cueChannelState[0] == 4 or cueChannelState[1] == 4 or cueChannelState[2] == 4  or cueChannelState[3] == 4)) {
      //Cancel a master go
      for (int i = 0; i <= 3; i++) {
        cueChannelState[i] = 0;
      }
      ledOff(cueOutstationPins0[7]);
      ledOff(cueOutstationPins0[11]);
      ledOff(cueOutstationPins1[7]);
      ledOff(cueOutstationPins1[11]);
      ledOff(cueOutstationPins2[7]);
      ledOff(cueOutstationPins2[11]);
      ledOff(cueOutstationPins3[7]);
      ledOff(cueOutstationPins3[11]);
      ledOff(11);
      ledOff(32);
    } else {
      //Trigger a master go
      for (int i = 0; i <= 3; i++) {
        cueChannelState[i] = 4;
      }
      ledOff(cueOutstationPins0[6]);
      ledOff(cueOutstationPins0[10]);
      ledOn(cueOutstationPins0[7]);
      ledOn(cueOutstationPins0[11]);
      ledOff(cueOutstationPins1[6]);
      ledOff(cueOutstationPins1[10]);
      ledOn(cueOutstationPins1[7]);
      ledOn(cueOutstationPins1[11]);
      ledOff(cueOutstationPins2[6]);
      ledOff(cueOutstationPins2[10]);
      ledOn(cueOutstationPins2[7]);
      ledOn(cueOutstationPins2[11]);
      ledOff(cueOutstationPins3[6]);
      ledOff(cueOutstationPins3[10]);
      ledOn(cueOutstationPins3[7]);
      ledOn(cueOutstationPins3[11]);
      ledOn(11); //Master go light
      ledOff(32);
    }
  }
}

bool channelStandbyButton(int i, unsigned int outstationPins[]) {
  if (cueChannelState[i] == 0 or cueChannelState[i] == 3 or cueChannelState[i] == 4) {
    //Go onto standby
    cueChannelState[i] = 1;
    ledFlash(outstationPins[6], ledFacepanelFrequencyStandby);
    ledFlash(outstationPins[10], ledOutstationFrequencyStandby);

    ledOff(outstationPins[7]);
    ledOff(outstationPins[11]);
  } else if (cueChannelState[i] == 1 or cueChannelState[i] == 2 or cueChannelState[i] == 5 or cueChannelState[i] == 9) {
    //Turn off standby
    cueChannelState[i] = 0;
    ledOff(outstationPins[6]);
    ledOff(outstationPins[10]);
    ledOff(32);
  } else if (cueChannelState[i] == 10 and callbackOff != true) {
    //Acknowledge a callback
    cueChannelState[i] = 0;
    ledOff(outstationPins[6]);
    ledOff(outstationPins[10]);
  }
}
bool channelAckButton(int i, unsigned int outstationPins[]) {
  if (cueChannelState[i] == 1 or cueChannelState[i] == 9) {
    //Ack a standby
    cueChannelState[i] = 2;
    ledOn(outstationPins[6]);
    ledOn(outstationPins[10]);
  } else if (callbackOff != true) {
    //Send a callback
    cueChannelState[i] = 10;
    ledFlash(outstationPins[6], ledFacepanelFrequencyCallback);
    ledFlash(outstationPins[10], ledOutstationFrequencyCallback);
  }
}
bool channelOutstationGoButton(int i, unsigned int outstationPins[]) {
  if (cueChannelState[i] == 1 or cueChannelState[i] == 9) {
    channelAckButton(i, outstationPins);
  } else if (callbackOff != true and cueChannelState[i] == 10) {
    //Cancel a callback
    cueChannelState[i] = 0;
    ledOff(outstationPins[6]);
    ledOff(outstationPins[10]);
  }
}
bool channelGoButton(int i, unsigned int outstationPins[]) {
  //
  if (cueChannelState[i] == 0 or cueChannelState[i] == 1 or cueChannelState[i] == 2 or cueChannelState[i] == 5 or cueChannelState[i] == 7 or cueChannelState[i] == 10 or cueChannelState[i] == 9) {
    //Send a GO command
    cueChannelState[i] = 3;
    ledOff(outstationPins[6]);
    ledOff(outstationPins[10]);
    ledOn(outstationPins[7]);
    ledOn(outstationPins[11]);
    ledOff(32);
  } else if ((cueChannelState[i] == 3 or cueChannelState[i] == 4 or cueChannelState[i] == 8) and pushToGoOff) {
    //Cancel a go
    cueChannelState[i] = 0;
    ledOff(outstationPins[7]);
    ledOff(outstationPins[11]);
  }
}


//      LEDs
void ledOn(int i) {
  ledFlashingFrequency[i] = 0; //Stop any flashing
  serialBroadcast(String("LEDStatus,")+i+","+"1");
  if (ledPins[i] != 255) { //Not fitted to this device
    digitalWrite(ledPins[i], HIGH);
  }
  
}
void ledOff(int i) {
  ledFlashingFrequency[i] = 0; //Stop any flashing
  serialBroadcast(String("LEDStatus,")+i+","+"0");
  if (ledPins[i] != 255) { //Not fitted to this device
    digitalWrite(ledPins[i], LOW);
  }  
}
bool ledStatus(int i) {
  if (ledPins[i] == 255) { //Not fitted to this device
    return;
  } else if (digitalRead(ledPins[i]) == HIGH) {
    return true;
  } else {
    return false;
  }
}
bool ledFlashing(int i) { //Is the LED i flashing?
  if (ledFlashingFrequency[i] == 0) return false;
  else return true;
}
void ledFlash(int i, unsigned int frequency) { //Start this LED flashing - to stop it set it to off or on using other functions. frequency is in Hz
  ledFlashingFrequency[i] = frequency;
  serialBroadcast(String("LEDStatus,")+i+","+frequency);
}
void loopHandleLedFlashes() { //Called in the loop
  int i;
  for (i = 0; i < ledCount; i = i + 1) {
    if (ledFlashingFrequency[i] > 0 && (int(((1.0 / ledFlashingFrequency[i]) * 1000)) <= (millis() - ledFlashingLastChangeTime[i]))) {
      if (ledPins[i] != 255) { //Not fitted to this device
        digitalWrite(ledPins[i],  !digitalRead(ledPins[i])); //Take whatever state LED is in rtn and swap it
      } 
      ledFlashingLastChangeTime[i] = millis();
    }
  }
}
//      MENU

boolean arrayIncludeElement(byte array[], int element) {
  for (int i = 0; i < ledCount; i++) {
    if (array[i] == element) {
      return true;
    }
  }
  return false;
}

//      SERIAL HANDLING
void handleSerialMessage(String messageString) {
  int commaIndex = messageString.indexOf(',');
  int secondCommaIndex = messageString.indexOf(',', commaIndex + 1);
  int thirdCommaIndex = messageString.indexOf(',', secondCommaIndex + 1);

  String firstValue = messageString.substring(0, commaIndex);
  String secondValue = messageString.substring(commaIndex + 1, secondCommaIndex);
  String thirdValue = messageString.substring(secondCommaIndex + 1, thirdCommaIndex);
  String forthValue = messageString.substring(thirdCommaIndex + 1);

  if (firstValue == "PING") {
    serialBroadcast("CUEBOK");
  } else if (firstValue == "LED") {
    /*
     * LED COMMAND
     * LED,[1 for on, 0 for off, 2 for report status],[LED Number],[LED Channel if it's an outstation]
     * 
     * Report status returns: 0 off, 1 on, 2 flash
     */
    int ledStatusCommand = secondValue.toInt();
    int ledNumber = thirdValue.toInt();
    int ledChannel = forthValue.toInt();
    if (ledChannel > 0) {
      if (ledChannel == 1) {
        ledNumber = cueOutstationPins0[ledNumber];
      } else if (ledChannel == 2) {
        ledNumber = cueOutstationPins1[ledNumber];
      } else if (ledChannel == 3) {
        ledNumber = cueOutstationPins2[ledNumber];
      } else if (ledChannel == 4) {
        ledNumber = cueOutstationPins3[ledNumber];
      }
    }
    if (ledStatusCommand == 1) {
      ledOn(ledNumber);
    } else if (ledStatusCommand == 0) {
      ledOff(ledNumber);
    } else if (ledStatusCommand == 2) {
      if (ledStatus(ledNumber)) {
        serialBroadcast("LEDStatus:1");
      } else if (ledFlashing(ledNumber)) {
        serialBroadcast("LEDStatus:2");
      } else {
        serialBroadcast("LEDStatus:0");
      }
    }
  } else if (firstValue == "LEDFlash") {
    /*
     * LED COMMAND
     * LEDFlash,[Frequency],[LED Number],[LED Channel if it's an outstation]
     * 
     */
    int ledFrequency = secondValue.toInt();
    int ledNumber = thirdValue.toInt();
    int ledChannel = forthValue.toInt();
    if (ledChannel > 0) {
      if (ledChannel == 1) {
        ledNumber = cueOutstationPins0[ledNumber];
      } else if (ledChannel == 2) {
        ledNumber = cueOutstationPins1[ledNumber];
      } else if (ledChannel == 3) {
        ledNumber = cueOutstationPins2[ledNumber];
      } else if (ledChannel == 4) {
        ledNumber = cueOutstationPins3[ledNumber];
      }
    }
    ledFlash(ledNumber,ledFrequency);
        
  } else if (firstValue == "BTNStatus") {
    /*
     * 
     * 
     */
    int ledFrequency = secondValue.toInt();
    int ledNumber = thirdValue.toInt();
    int ledChannel = forthValue.toInt();
    if (ledChannel > 0) {
      if (ledChannel == 1) {
        ledNumber = cueOutstationPins0[ledNumber];
      } else if (ledChannel == 2) {
        ledNumber = cueOutstationPins1[ledNumber];
      } else if (ledChannel == 3) {
        ledNumber = cueOutstationPins2[ledNumber];
      } else if (ledChannel == 4) {
        ledNumber = cueOutstationPins3[ledNumber];
      }
    }
    ledFlash(ledNumber,ledFrequency);
        
  } else if (firstValue == "BTNClick") {
    int pinNumber = secondValue.toInt();
    buttonPressed(pinNumber);
  } else if (firstValue == "BTNUnClick") {
    int pinNumber = secondValue.toInt();
    buttonReleased(pinNumber,0);
  } else {
    serialBroadcast(firstValue);
    serialBroadcast(secondValue);
    serialBroadcast(thirdValue);
    serialBroadcast(forthValue);
  }
}

//  SETUP
String readString;
void setup() {
  Serial.begin(115200);
  #if !NETWORKED
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  #endif

  

  //    SCREEN
  if (lcdPins[0] != 255) {
    lcdFitted = true;
    lcd.begin(16, 2);
    lcd.noAutoscroll();

    lcd.home ();
    lcd.print("JBITHELL LOADING");
    lcd.home ();
    if (EEPROM.read(0) == 1) {
      lcd.setBacklight(LOW);
    } else {
      lcd.setBacklight(HIGH);
    }
  }

  //    BUTTONS
  //     Setup each of our buttons
  int i;
  for (i = 0; i < buttonsCount; i = i + 1) {
    if (buttonsPins[i] != 255) {
      pinMode(buttonsPins[i], INPUT_PULLUP);
      buttonsLastDebounceTime[i] = 0;
      buttonsLastState[i] = digitalRead(buttonsPins[i]);
      buttonsState[i] = digitalRead(buttonsPins[i]);
      if (buttonsState[i] != buttonsDownState[i]) {
        serialBroadcast(String("BTNStatus,")+buttonDetailsCoded(i)+","+"0");
      } else {
        serialBroadcast(String("BTNStatus,")+buttonDetailsCoded(i)+","+"1");
      }
      buttonsHeldTime[i] = millis();
    }
  }
  //    LEDs

  for (i = 0; i < ledCount; i = i + 1) {
    if (ledPins[i] != 255) {
      pinMode(ledPins[i], OUTPUT); //Setup the LED and then turn it on to test it
      //digitalWrite(ledPins[i], HIGH);
      ledFlashingFrequency[i] = 0;
      ledFlashingLastChangeTime[i] = 1;
      //delay(bootDelayForLEDFlashTime);
      digitalWrite(ledPins[i], LOW); //Turn all LEDs off
    }
  }

  //    Cue system
  for (i = 0; i < cueOutstationCount; i = i + 1) {
    cueChannelState[i] = 0;
  }




  if (buttonsPins[cueOutstationPins0[4]] != 255 && digitalRead(buttonsPins[cueOutstationPins0[4]]) != buttonsDownState[cueOutstationPins0[4]]) { //EStop
    ledOn(cueOutstationPins0[9]);
  }
  if (buttonsPins[cueOutstationPins0[5]] != 255 && digitalRead(buttonsPins[cueOutstationPins0[5]]) != buttonsDownState[cueOutstationPins0[5]]) { //3rd button
    ledOn(cueOutstationPins0[8]);
  }
  if (buttonsPins[cueOutstationPins1[4]] != 255 && digitalRead(buttonsPins[cueOutstationPins1[4]]) != buttonsDownState[cueOutstationPins1[4]]) { //EStop
    ledOn(cueOutstationPins1[9]);
  }
  if (buttonsPins[cueOutstationPins1[5]] != 255 && digitalRead(buttonsPins[cueOutstationPins1[5]]) != buttonsDownState[cueOutstationPins1[5]]) { //3rd button
    ledOn(cueOutstationPins1[8]);
  }
  if (buttonsPins[cueOutstationPins2[4]] != 255 && digitalRead(buttonsPins[cueOutstationPins2[4]]) != buttonsDownState[cueOutstationPins2[4]]) { //EStop
    ledOn(cueOutstationPins2[9]);
  }
  if (buttonsPins[cueOutstationPins2[5]] != 255 && digitalRead(buttonsPins[cueOutstationPins2[5]]) != buttonsDownState[cueOutstationPins2[5]]) { //3rd button
    ledOn(cueOutstationPins2[8]);
  }
  if (buttonsPins[cueOutstationPins3[4]] != 255 && digitalRead(buttonsPins[cueOutstationPins3[4]]) != buttonsDownState[cueOutstationPins3[4]]) { //EStop
    ledOn(cueOutstationPins3[9]);
  }
  if (buttonsPins[cueOutstationPins3[5]] != 255 && digitalRead(buttonsPins[cueOutstationPins3[5]]) != buttonsDownState[cueOutstationPins3[5]]) { //3rd button
    ledOn(cueOutstationPins3[8]);
  }

  #if NETWORKED
    #if DHCP
      Ethernet.begin(mac);
    #else
      Ethernet.begin(mac,ip);
    #endif
    if (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("Ethernet shield was not found.");
      while (true) {
        delay(1); // do nothing, no point running without Ethernet hardware
      }
    }
    else if (Ethernet.hardwareStatus() == EthernetW5100) {
      Serial.println("W5100 Ethernet controller detected.");
    }
    else if (Ethernet.hardwareStatus() == EthernetW5200) {
      Serial.println("W5200 Ethernet controller detected.");
    }
    else if (Ethernet.hardwareStatus() == EthernetW5500) {
      Serial.println("W5500 Ethernet controller detected.");
    }
  
    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }
    
    Serial.print(F("Server running at "));
    Serial.print(Ethernet.localIP());
    Serial.print(F(":"));
    Serial.println(port);
    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }
    
    wss.onConnection([](WebSocket &ws) {
      ws.onMessage([](WebSocket &ws, const WebSocket::DataType &dataType,
                     const char *message, uint16_t length) {
        switch (dataType) {
        case WebSocket::DataType::TEXT:
          Serial.print(F("Received: "));
          Serial.println(message);
          handleSerialMessage(message);
          break;
        case WebSocket::DataType::BINARY:
          Serial.println(F("Received binary data"));
          break;
        }
  
        ws.send(dataType, message, length);
      });
  
      ws.onClose(
        [](WebSocket &ws, const WebSocket::CloseCode &code, const char *reason,
          uint16_t length) {
            Serial.println(F("Disconnected")); 
            });
  
      Serial.print(F("New client: "));
      Serial.println(ws.getRemoteIP());
  
      const char message[]{ "CUEBOK" };
      ws.send(WebSocket::DataType::TEXT, message, strlen(message));
    });
  
    wss.begin();
  #endif
  

  //    SETUP DONE
  serialBroadcast("CUEBOK");
  writeToScreen("      CueB      ", 1);
  writeToScreen("****************", 2);
  ledOn(0);  
}

void loop() {
  loopCheckStateOfButtons(); //Check and update the debounce timers for all our buttons
  loopHandleLedFlashes(); //Flash the LEDs if they need doing

  if (Serial.available())  {
    char c = Serial.read();  //gets one byte from serial buffer
    if (c == '\n') {  //looks for end of data packet marker 
      serialBroadcast(readString); //prints string to serial port out
      handleSerialMessage(readString);
      readString=""; //clears variable for new input      
     }  
    else {     
      readString += c; //makes the string readString
    }
  }
  #if NETWORKED
    wss.listen();
  #endif
}
