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
/* LED List
 *  0 = Menu not open - screen can do as it pleases
 *  1 = Menu level 1 - "master menu" for selecting mode and settings
 *  2 = About
 *  3 = Settings
 *  4 = Backlight on/off  
 */
unsigned int menuMode = 0; //Menu Mode
unsigned int menuTier = 0; //Menu Sub tier


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
}
// Function called when a button is released - it's expected this won't normally be used
void buttonReleased(int i, unsigned long holdTime) { //holdTime is how long the button was held for before being released in Milliseconds
  switch (i) {
    case 1:
      //TBC
      break;
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
