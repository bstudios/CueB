//  CONFIG
#include "config.h"


//  SETUP
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
  
}
// Function called when a button is pressed
void buttonPressed(int i) {
  
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
//  SETUP
void setup() {
  //    SERIAL
  Serial.begin(9600);
  Serial.println("BOOTING");
  
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
  Serial.println("BOOTED");
}

void loop() {
  loopCheckStateOfButtons(); //Check and update the debounce timers for all our buttons
  loopHandleLedFlashes(); //Flash the LEDs if they need doing
}
