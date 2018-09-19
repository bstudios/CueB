 // IMPORTS FOR TEMPERATURE SENSOR
#include <Wire.h>
#include <Adafruit_HTU21DF.h>

//  IMPORTS FOR SCREEN
#include <LiquidCrystal_I2C.h> //Include the exact library in a zip that's included with this project source
#include <EEPROM.h>

//  CONFIG
#include "config.h"


//  SETUP
//      TEMPERATURE
Adafruit_HTU21DF htu = Adafruit_HTU21DF();
//      SCREEN
LiquidCrystal_I2C lcd(0x3F, 2, 1, 0, 4, 5, 6, 7, 3, POSITIVE); //Be sure to run this screen at 5V - it's rubbish at 3.3V
//      BUTTONS
const unsigned long buttonsDebounceDelay = 100; // How long to do a debounce check for
unsigned long buttonsLastDebounceTime[buttonsCount]; //The last time each button was pressed
unsigned long buttonsHeldTime[buttonsCount]; //How long button has been held for
int buttonsState[buttonsCount];
int buttonsLastState[buttonsCount];
//      LEDs
unsigned int ledFlashingFrequency[ledCount]; //How many Hz is this LED flashing at? 0 = not flashing
unsigned long ledFlashingLastChangeTime[ledCount]; //When did this LED last change state?
//      MENU
/* MenuMode List
 *  0 = Menu not open - screen can do as it pleases
 *  1 = Menu level 1 - "master menu" for selecting mode and settings
 *  2 = About
 *  3 = Settings
 */
unsigned int menuMode = 0; //Menu Mode
unsigned int menuTier = 0; //Menu Sub tier
//      CUE LOGIC
unsigned int cueChannelState[cueOutstationCount];
/* States
 *  0 All leds off - nothing happening
 *  1 Standby sent
 *  2 Standby acknowledged - waiting for go
 *  3 Go
 *  4 Master go sent
 *  5 Standby sent automatically
 *  7 Auto standby ack
 *  8 Auto go sent
 *  9 ----
 *  10 Callback (panic type thing) sent
 *  11 ---
 */

//  FUNCTIONS
//      GENERAL
void(* rebootArduino) (void) = 0;  // Reboot arudino https://arduino.stackexchange.com/a/1478
//      BUTTONS
//      SCREEN
bool writeToScreen(String text, int line) {
  if (line == 1) {
    lcd.setCursor(0,0);
    lcd.print("                "); //Clear that line of the display 
    lcd.setCursor(0,0);
  } else if (line == 2) {
    lcd.setCursor(0,1);
    lcd.print("                "); //Clear that line of the display 
    lcd.setCursor(0,1);
  } else {
    text = " LINE SET WRONG ";
  }
  
  if (text.length()>16) { //If string too long for system print an error
    text = "STRING TOO LONG ";
  }
  
  
  //
  lcd.print(text);
}
//      BUTTONS
//        Check state of all the buttons and update their debounce timers accordingly


void loopCheckStateOfButtons() {
    int i;
    for (i = 0; i < buttonsCount; i = i + 1) {
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
  if (pushToGoOff != true) {
    //Their system is using push to go so if this is a go button that's illuminated it should be turned off as they release it
    if (i == 11 and (cueChannelState[0] == 4 or cueChannelState[1] == 4 or cueChannelState[2] == 4 or cueChannelState[3] == 4)) {
      //If a master go has been used
      ledOff(buttonsPins[11]); //Turn off master Go light

      //Turn all the lights off
      cueChannelState[0] = 0;
      ledOff(cueOutstationPins0[4]);
      ledOff(cueOutstationPins0[5]); 
      ledOff(cueOutstationPins0[6]);
      ledOff(cueOutstationPins0[7]);
      cueChannelState[1] = 0;
      ledOff(cueOutstationPins1[4]);
      ledOff(cueOutstationPins1[5]); 
      ledOff(cueOutstationPins1[6]);
      ledOff(cueOutstationPins1[7]);
      cueChannelState[2] = 0;
      ledOff(cueOutstationPins2[4]);
      ledOff(cueOutstationPins2[5]); 
      ledOff(cueOutstationPins2[6]);
      ledOff(cueOutstationPins2[7]);
      cueChannelState[3] = 0;
      ledOff(cueOutstationPins3[4]);
      ledOff(cueOutstationPins3[5]); 
      ledOff(cueOutstationPins3[6]);
      ledOff(cueOutstationPins3[7]);
    }
    if (cueChannelState[0] == 3 and i == cueOutstationPins0[1]) {
      //Turn off Channel 0 as Go has been released
      cueChannelState[0] = 0;
      ledOff(cueOutstationPins0[4]);
      ledOff(cueOutstationPins0[5]); 
      ledOff(cueOutstationPins0[6]);
      ledOff(cueOutstationPins0[7]);
    }
    if (cueChannelState[1] == 3 and i == cueOutstationPins1[1]) {
      //Turn off Channel 1 as Go has been released
      cueChannelState[1] = 0;
      ledOff(cueOutstationPins1[4]);
      ledOff(cueOutstationPins1[5]); 
      ledOff(cueOutstationPins1[6]);
      ledOff(cueOutstationPins1[7]);
    }
    if (cueChannelState[2] == 3 and i == cueOutstationPins2[1]) {
      //Turn off Channel 2 as Go has been released
      cueChannelState[2] = 0;
      ledOff(cueOutstationPins2[4]);
      ledOff(cueOutstationPins2[5]); 
      ledOff(cueOutstationPins2[6]);
      ledOff(cueOutstationPins2[7]);
    }
    if (cueChannelState[3] == 3 and i == cueOutstationPins3[1]) {
      //Turn off Channel 3 as Go has been released
      cueChannelState[3] = 0;
      ledOff(cueOutstationPins3[4]);
      ledOff(cueOutstationPins3[5]); 
      ledOff(cueOutstationPins3[6]);
      ledOff(cueOutstationPins3[7]);
    }  
  }

  //Switches as part of channel 3 (key switch and EStop)
  if (i == 16) {
    ledOn(13);
  } else if (i == 17) {
    ledOff(12);
  }
}
// Function called when a button is pressed
void buttonPressed(int i) {
  switch (i) {
    case 1: //Enter
      if (menuMode == 0) {
        menuMode = 1;
        writeToScreen("MENU",1);
        writeToScreen("Exit Menu",2);
      } else if (menuMode == 1 && menuTier == 0) {
        //Exit menu
        menuMode = 0;
        writeToScreen("      CueB      ",1);
        writeToScreen("****************",2);
      } else if (menuMode == 1 && menuTier == 1) {
        menuMode = 0;
        menuTier = 0;
        //Show about screen
        writeToScreen("CueB Cue Lights3",1);
        writeToScreen(currentVersion,2);
      } else if (menuMode == 1 && menuTier == 2) {
        menuMode = 3;
        menuTier = 1;
        //Show settings menu
        writeToScreen("MENU -> SETTINGS",1);
        writeToScreen("Backlight toggle",2);
      } else if (menuMode == 2) {
        menuMode = 0;
        writeToScreen("MENU",1);
        writeToScreen("Exit Menu",2);
      } else if (menuMode == 3) {
        if (menuTier == 0) {
          //Exit menu
          menuMode = 0;
          writeToScreen("      CueB      ",1);
          writeToScreen("****************",2);
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
            writeToScreen("IO and LEDs TEST",1);
            writeToScreen(" NO BTN PRESSED ",2);
            //  Turn on all LEDs
            for (i = 0; i < ledCount; i = i + 1) {
                ledOn(i);
            }
            delay(1000); //Because otherwise it'll pick up the enter key being pressed to get onto this page
            //  Show on screen any button that might get pressed
            while(true) {
              for (i = 0; i < buttonsCount; i = i + 1) {
                if (digitalRead(buttonsPins[i]) == buttonsDownState[i]) {
                  writeToScreen(buttonDetails(i),2);
                }
              }
            }
            //They need to reboot manually to get out of this facility
        }  else if (menuTier == 3) {
          //EPROM clear function https://www.arduino.cc/en/Tutorial/EEPROMClear - clear all the internal storage back to default
          writeToScreen("      CueB      ",1);
          writeToScreen(" RESET RUNNING *",2);
          for (int i = 0 ; i < EEPROM.length() ; i++) {
            EEPROM.write(i, 0);
          }
          rebootArduino();
        } 
        //Show settings menu
               
      } else if (menuMode == 3 && menuTier == 1) {
        menuTier = 1;
        //Show settings menu
        writeToScreen("Settings item 2",2);
      } 
      break;
    case 0: //Up
      if (menuMode == 1) {
        if (menuTier == 1) {
          menuTier = 0;
          writeToScreen("Exit Menu",2);
        } else if (menuTier == 2) {
          menuTier = 1;
          writeToScreen("About",2);
        } 
      } else if (menuMode == 3) {
         if (menuTier == 1) {
          menuTier = 0;
          writeToScreen("Exit Menu",2);
        }  else if (menuTier == 2) {
          menuTier = 1;
          writeToScreen("Backlight toggle",2);
        }   else if (menuTier == 3) {
          menuTier = 2;
          writeToScreen("IO & LED Test",2);
        } 
      }
      break;
   case 2: //Down
      if (menuMode == 1) {
        if (menuTier == 0) {
          menuTier = 1;
          writeToScreen("About",2);
        } else if (menuTier == 1) {
          menuTier = 2;
          writeToScreen("Settings",2);
        }
      } else if (menuMode == 3) {
        if (menuTier == 0) {
          menuTier = 1;
          writeToScreen("Backlight toggle",2);
        } else if (menuTier == 1) {
          menuTier = 2;
          writeToScreen("IO & LED Test",2);
        }  else if (menuTier == 2) {
          menuTier = 3;
          writeToScreen("Factory Reset",2);
        }  
      } 
      break;
    
  }

  //Buttons - primary cue logic - channel 0
  if (i == cueOutstationPins0[0]) {
    channelStandbyButton(0, cueOutstationPins0);
  } else if (i == cueOutstationPins0[2]) {
    channelAckButton(0, cueOutstationPins0);
  } else if (i == cueOutstationPins0[1]) {
    channelGoButton(0, cueOutstationPins0);
  }

    //Buttons - primary cue logic - channel 1
  if (i == cueOutstationPins1[0]) {
    channelStandbyButton(1, cueOutstationPins1);
  } else if (i == cueOutstationPins1[2]) {
    channelAckButton(1, cueOutstationPins1);
  } else if (i == cueOutstationPins1[1]) {
    channelGoButton(1, cueOutstationPins1);
  }

    //Buttons - primary cue logic - channel 2
  if (i == cueOutstationPins2[0]) {
    channelStandbyButton(2, cueOutstationPins2);
  } else if (i == cueOutstationPins2[2]) {
    channelAckButton(2, cueOutstationPins2);
  } else if (i == cueOutstationPins2[1]) {
    channelGoButton(2, cueOutstationPins2);
  }

  //Buttons - primary cue logic - channel 3
  if (i == cueOutstationPins3[0]) {
    channelStandbyButton(3, cueOutstationPins3);
  } else if (i == cueOutstationPins3[2]) {
    channelAckButton(3, cueOutstationPins3);
  } else if (i == cueOutstationPins3[1]) {
    channelGoButton(3, cueOutstationPins3);
  }

  //Switches as part of channel 3 (key switch and EStop)
  if (i == 16) {
    ledOff(13);
  } else if (i == 17) {
    ledOn(12);
  }

  
  if (i == 11) {
    //Master go pressed
    if (pushToGoOff and (cueChannelState[0] == 4 or cueChannelState[1] == 4 or cueChannelState[2] == 4  or cueChannelState[3] == 4)) {
      //Cancel a master go
      for (int i=0; i <= 3; i++){
         cueChannelState[i] = 0;
       }
      ledOff(cueOutstationPins0[5]);
      ledOff(cueOutstationPins0[7]);
      ledOff(cueOutstationPins1[5]);
      ledOff(cueOutstationPins1[7]);
      ledOff(cueOutstationPins2[5]);
      ledOff(cueOutstationPins2[7]);
      ledOff(cueOutstationPins3[5]);
      ledOff(cueOutstationPins3[7]);
      ledOff(ledPins[11]);
    } else {
      //Trigger a master go
            for (int i=0; i <= 3; i++){
             cueChannelState[i] = 4;
           }
           ledOff(cueOutstationPins0[4]);
           ledOff(cueOutstationPins0[6]);
           ledOn(cueOutstationPins0[5]);
           ledOn(cueOutstationPins0[7]);
           ledOff(cueOutstationPins1[4]);
           ledOff(cueOutstationPins1[6]);
           ledOn(cueOutstationPins1[5]);
           ledOn(cueOutstationPins1[7]);
           ledOff(cueOutstationPins2[4]);
           ledOff(cueOutstationPins2[6]);
           ledOn(cueOutstationPins2[5]);
           ledOn(cueOutstationPins2[7]);
           ledOff(cueOutstationPins3[4]);
           ledOff(cueOutstationPins3[6]);
           ledOn(cueOutstationPins3[5]);
           ledOn(cueOutstationPins3[7]);
           ledOn(ledPins[11]);
    }
  }
}

bool channelStandbyButton(int i, unsigned int outstationPins[]) {
  if (cueChannelState[i] == 0 or cueChannelState[i] == 3 or cueChannelState[i] == 4) {
    //Go onto standby
    cueChannelState[i] = 1; 
    ledFlash(outstationPins[4], ledFacepanelFrequencyStandby);
    ledFlash(outstationPins[6], ledOutstationFrequencyStandby);
    
    ledOff(outstationPins[5]);
    ledOff(outstationPins[7]);
  } else if (cueChannelState[i] == 1 or cueChannelState[i] == 2 or cueChannelState[i] == 5) {
    //Turn off standby
    cueChannelState[i] = 0; 
    ledOff(outstationPins[4]);
    ledOff(outstationPins[6]);
  } else if (cueChannelState[i] == 10 and callbackOff != true) {
    //Acknowledge a callback
    cueChannelState[i] = 0; 
    ledOff(outstationPins[4]);
    ledOff(outstationPins[6]);
  }
}
bool channelAckButton(int i, unsigned int outstationPins[]) {
  if (cueChannelState[i] == 1) {
    //Ack a go
    cueChannelState[i] = 2; 
    ledOn(outstationPins[4]);
    ledOn(outstationPins[6]);
  } else if (callbackOff != true) { 
    //Send a callback
    cueChannelState[i] = 10; 
    ledFlash(outstationPins[4], ledFacepanelFrequencyCallback);
    ledFlash(outstationPins[6], ledOutstationFrequencyCallback);
  }
}
bool channelGoButton(int i, unsigned int outstationPins[]) {
  //
  if (cueChannelState[i] == 0 or cueChannelState[i] == 1 or cueChannelState[i] == 2 or cueChannelState[i] == 5 or cueChannelState[i] == 7 or cueChannelState[i] == 10) {
    //Send a GO command
    cueChannelState[i] = 3; 
    ledOff(outstationPins[4]);
    ledOff(outstationPins[6]);
    ledOn(outstationPins[5]);
    ledOn(outstationPins[7]);
  } else if ((cueChannelState[i] == 3 or cueChannelState[i] == 4 or cueChannelState[i] == 8) and pushToGoOff) { 
    //Cancel a go
    cueChannelState[i] = 0; 
    ledOff(outstationPins[5]);
    ledOff(outstationPins[7]);
  }
}


//      LEDs
void ledOn(int i) {
  ledFlashingFrequency[i] = 0; //Stop any flashing
  digitalWrite(ledPins[i], HIGH);
}
void ledOff(int i) {
  ledFlashingFrequency[i] = 0; //Stop any flashing
  digitalWrite(ledPins[i], LOW);
}
bool ledStatus(int i) {
  if (digitalRead(ledPins[i]) == HIGH) {
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
}
void loopHandleLedFlashes() { //Called in the loop 
  int i;
  for (i = 0; i < ledCount; i = i + 1) {
    if (ledFlashingFrequency[i] > 0 && (int(((1.0/ledFlashingFrequency[i])*1000)) <= (millis() - ledFlashingLastChangeTime[i]))) {
      digitalWrite(ledPins[i],  !digitalRead(ledPins[i])); //Take whatever state LED is in rtn and swap it
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


//  SETUP
void setup() {
  //    SERIAL
  Serial.begin(9600);
  Serial.println("BOOTING");
  
  //    SCREEN
  lcd.begin(16,2);          
  lcd.noAutoscroll();
  
  lcd.home ();
  lcd.print("JBITHELL LOADING");
  lcd.home ();
  if (EEPROM.read(0) == 1) {
    lcd.setBacklight(LOW); 
  } else {
    lcd.setBacklight(HIGH);
  }
  //    TEMPERATURE SENSOR  
  /*
  if (!htu.begin()) {
    writeToScreen("Couldn't find sensor!",1);
    while (1);
  }
  */
  //    BUTTONS
  //     Setup each of our buttons
  int i;
  for (i = 0; i < buttonsCount; i = i + 1) {
    pinMode(buttonsPins[i], INPUT_PULLUP);
    buttonsLastDebounceTime[i] = 0;
    buttonsLastState[i] = digitalRead(buttonsPins[i]);
    buttonsState[i] = digitalRead(buttonsPins[i]);
    buttonsHeldTime[i] = millis();
  }
  //    LEDs

  for (i = 0; i < ledCount; i = i + 1) {
    pinMode(ledPins[i], OUTPUT); //Setup the LED and then turn it on to test it
    digitalWrite(ledPins[i], HIGH); 
    ledFlashingFrequency[i] = 0;
    ledFlashingLastChangeTime[i] = 1;
    delay(bootDelayForLEDFlashTime);
    digitalWrite(ledPins[i], LOW); //Turn all LEDs off
  }

  //    Cue system
  for (i = 0; i < cueOutstationCount; i = i + 1) {
    cueChannelState[i] = 0;
  }
  //    Facepanel EStop/Lights for channel 3
  if (digitalRead(buttonsPins[16]) != buttonsDownState[16]) {
    ledOn(13);
  }
  if (digitalRead(buttonsPins[17]) == buttonsDownState[17]) { //If EStop is pressed turn the light on
    ledOn(12);
  }

   
  //    SETUP DONE
  
  writeToScreen("      CueB      ",1);
  writeToScreen("****************",2);
  ledOn(0);
  Serial.println("BOOTED");
}

void loop() {
  loopCheckStateOfButtons(); //Check and update the debounce timers for all our buttons
  loopHandleLedFlashes(); //Flash the LEDs if they need doing

  //writeToScreen("Temp: " + (String(htu.readTemperature())), 1);
  //lcd.setCursor(0,1);
  //writeToScreen("Humid: " + (String(htu.readHumidity())), 2);
  //delay(500);
}
