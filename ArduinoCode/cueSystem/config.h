//  CONFIG
const String currentVersion = "Version 3.0 Beta";
//      BUTTONS
//        Full list of buttons mostly for internal purposes - but formatted like this so it can be displayed on LCD. The number is an index of the list of Buttons as defined
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
      //    CONTROL PANEL GO/STANDBY BUTTONS - ALL MATCH UP WITH THEIR RESPECTIVE LED NUMBERS FOR EASE OF USE
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
  }
}
const byte buttonsCount = 14; //The number of buttons currently in existence
const byte buttonsPins[buttonsCount] = {28,30,29,41,45,53,49,42,46,36,37,35,8,10}; //The pins of each of the buttons currently in existence
const int buttonsDownState[buttonsCount] = {LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW,LOW}; //The state that the button is in when it's down (ie pressed)
//      LEDS
/* LED List
 *  0 = Power indicator
 *  1 = Green LED indicator
 *  2 = Blue LED indicator
 *      CONTROL PANEL GO/STANDBY BUTTONS - ALL MATCH UP WITH THEIR RESPECTIVE LED NUMBERS FOR EASE OF USE
 *  3 = 1 Standby
 *  4 = 1 Go
 *  5 = 2 Standby
 *  6 = 2 Go
 *  7 = 3 Standby
 *  8 = 3 Go
 *  9 = 4 Standby
 *  10 = 4 Go
 *  11 = Master Go
 *      EXTRA CONTROL PANEL INDICATORS
 *  12 = 4 - Emergency Stop indicator 
 *  13 = 4 - Blue Key Switch indicator
 *      OUTSTATIONS
 *  14 = 1 Standby
 *  15 = 1 Go
 *  16 = 2 Standby
 *  17 = 3 Go
 */
const byte ledCount = 18; //The number of buttons currently in existence
const byte ledPins[ledCount] = {32,31,33,43,39,51,47,44,48,38,40,34,52,50,12,11,9,13}; //The pins of each of the buttons currently in existence

const int ledFrequencyStandby = 5; //Flash frequency for standby light (Hz) - beyond about 40 Hz it stops being obvious it's actually flashing
const int ledFrequencyCallback = 10; //Flash frequency for callback light on controller (Hz)
const int bootDelayForLEDFlashTime = 150; //How long to display each LED for in the boot sequence (it flashes each LED in turn for this amount of time

