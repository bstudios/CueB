//CONFIG
//        Full list of buttons mostly for internal purposes - but formatted like this so it can be displayed on LCD. The number is an index of the list of Buttons as defined

//      GENERAL Settings
const int ledFacepanelFrequencyStandby = 5; //Flash frequency for standby light (Hz) - beyond about 40 Hz it stops being obvious it's actually flashing
const int ledOutstationFrequencyStandby = 5; //Flash frequency for standby light (Hz) - beyond about 40 Hz it stops being obvious it's actually flashing
const int ledFacepanelFrequencyCallback = 10; //Flash frequency for callback light on controller (Hz)
const int ledOutstationFrequencyCallback = 10; //Flash frequency for callback light on controller (Hz)
const int bootDelayForLEDFlashTime = 50; //How long to display each LED for in the boot sequence (it flashes each LED in turn for this amount of time
const unsigned long buttonsDebounceDelay = 100; // How long to do a debounce check for
const bool callbackOff = false; //TODO move these to a setting in menu
const bool pushToGoOff = false; //TODO move these to a setting in menu

//      SET TO 255 if doesn't exist

//v3 Controller
//const byte buttonsPins[buttonsCount] = {255,255,255,255,255,255,15,2,255,255,255,255,52,13,39,36,50,48,11,12,49,51,26,34,40,8,45,38,255}; //The pins of each of the buttons currently in existence
//const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,HIGH,LOW}; //The state that the button is in when it's down (ie pressed)
//const byte ledPins[ledCount] = {255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,58,30,31,41,43,47,9,10,7,44,24,42,255}; //The pins of each of the KEDs currently in existence
//const byte lcdPins[8] = {255, 255, 255, 255, 255, 255, 255, 255}; //Set first one to 255 if not fitted

//v2 Controller
const byte buttonsPins[buttonsCount] = {28,30,29,41,45,53,49,42,46,36,37,35,8,10,5,7,255,255,255,255,255,255,15,2,255,255,255,255,255}; //The pins of each of the buttons currently in existence
const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,HIGH,LOW}; //The state that the button is in when it's down (ie pressed)
const byte ledPins[ledCount] = {32,31,33,43,39,51,47,44,48,38,40,34,255,255,255,255,255,255,52,50,12,11,255,9,13,255,3,6,255,4,14,255,255}; //The pins of each of the KEDs currently in existence
const byte lcdPins[8] = {2, 1, 0, 4, 5, 6, 7, 3}; //Set first one to 255 if not fitted
