//CONFIG
//        Full list of buttons mostly for internal purposes - but formatted like this so it can be displayed on LCD. The number is an index of the list of Buttons as defined
/*
 * LEDs
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
 /*
  * Buttons
    0 = Facepanel - Up
    1 = Facepanel - Entr
    2 = Facepanel - Down
    3 = 1 Standby
    4 = 1 Go
    5 = 2 Standby
    6 = 2 Go
    7 = 3 Standby
    8 = 3 Go
    9 = 4 Standby
    10 = 4 Go
    11 = Master Go
    12 = Outstation 1 ACK
    13 = Outstation 2 ACK
    14 = Outstation 3 ACK
    15 = Outstation 4 ACK
    16 = Outstation 1 Key
    17 = Outstation 1 Btn3
    18 = Outstation 2 Key
    19 = Outstation 2 Btn3
    20 = Outstation 3 Key
    21 = Outstation 3 Btn3
    22 = Outstation 4 Key
    23 = Outstation 4 Btn3
    24 = Outstation 1 Go
    25 = Outstation 2 Go
    26 = Outstation 3 Go
    27 = Outstation 4 Go
    28 = Master Standby
  */
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
//v2 Controller
//const byte buttonsPins[buttonsCount] = {28,30,29,41,45,53,49,42,46,36,37,35,8,10,5,7,255,255,255,255,255,255,15,2,255,255,255,255,255}; //The pins of each of the buttons currently in existence
//const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,HIGH,LOW}; //The state that the button is in when it's down (ie pressed)
//const byte ledPins[ledCount] = {32,31,33,43,39,51,47,44,48,38,40,34,255,255,255,255,255,255,52,50,12,11,255,9,13,255,3,6,255,4,14,255,255}; //The pins of each of the KEDs currently in existence
//const byte lcdPins[8] = {2, 1, 0, 4, 5, 6, 7, 3}; //Set first one to 255 if not fitted

//v3 Controller
//const byte buttonsPins[buttonsCount] = {255,255,255,255,255,255,255,255,255,255,255,255,36,39,13,52,26,34,49,51,11,12,50,48,28,45,8,40,255}; //The pins of each of the buttons currently in existence
//const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,HIGH,HIGH,HIGH,HIGH,HIGH,HIGH,HIGH,HIGH,LOW,LOW,LOW,LOW,LOW}; //The state that the button is in when it's down (ie pressed)
//const byte ledPins[ledCount] = {255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,38,30,32,41,43,47,9,10,7,44,24,42,255}; //The pins of each of the LEDs currently in existence
//const byte lcdPins[8] = {255, 255, 255, 255, 255, 255, 255, 255}; //Set first one to 255 if not fitted

//v4 Controller
const byte buttonsPins[buttonsCount] = {255,255,255,255,255,255,255,255,255,255,255,255,45,52,32,11,49,51,37,48,29,31,12,13,53,44,26,9,255}; //The pins of each of the buttons currently in existence
const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,HIGH,HIGH,HIGH,HIGH,HIGH,HIGH,HIGH,HIGH,LOW,LOW,LOW,LOW,LOW}; //The state that the button is in when it's down (ie pressed)
const byte ledPins[ledCount] = {255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,41,43,47,40,42,46,30,28,33,8,7,10,255};
const byte lcdPins[8] = {255, 255, 255, 255, 255, 255, 255, 255}; //Set first one to 255 if not fitted
