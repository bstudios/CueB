const int STATIONONEpins[] = {10, 19, 2, 5, 6}; //RedLED,GreenLED,AcknowledgeButton,StandbyButton,GOButton
bool STATIONONEbuttonStates[] = {false, false, false}; //For tracking button states in the loop (Ack, Standby, Go)
unsigned long STATIONONEbuttonLastPress[] = {0, 0, 0}; //For tracking button states in the loop (Ack, Standby, Go)
int STATIONONEredLEDState = LOW;      //6RedLED state
int STATIONONEgreenLEDState = LOW;    //7GreenLED state
bool STATIONONEredLEDFlash = false;   //8 RedLED Flashing?
unsigned long STATIONONEflashTimer = 0; //9Last time RedLED was flashed

const int STATIONTWOpins[] = {8, 9, 3, 18, 4}; //1RedLED,2GreenLED,3AcknowledgeButton,4StandbyButton,5GOButton
bool STATIONTWObuttonStates[] = {false, false, false}; //For tracking button states in the loop (Ack, Standby, Go)
unsigned long STATIONTWObuttonLastPress[] = {0, 0, 0}; //For tracking button states in the loop (Ack, Standby, Go)
int STATIONTWOredLEDState = LOW;      //6RedLED state
int STATIONTWOgreenLEDState = LOW;    //7GreenLED state
bool STATIONTWOredLEDFlash = false;   //8 RedLED Flashing?
unsigned long STATIONTWOflashTimer = 0; //9Last time RedLED was flashed

const int standbyMaster= 0; //Master standby button channel
const int GOMaster = 1; //Master go button channel
bool masterButtonStates[] = {false, false}; //For tracking button states in the loop (Go, standby)
unsigned long masterButtonLastPress[] = {0, 0}; //For tracking button states in the loop (Go, standby)
const long flashInterval = 300; //How often to Flash
const long debounceTime = 200;


void setup() {
  Serial.begin(9600);

  pinMode(STATIONONEpins[0], OUTPUT); //RedLED
  pinMode(STATIONONEpins[1], OUTPUT); //GreenLED
  pinMode(STATIONONEpins[2] , INPUT_PULLUP); //AcknowledgeButton
  pinMode(STATIONONEpins[3] , INPUT_PULLUP); //StandbyButton
  pinMode(STATIONONEpins[4] , INPUT_PULLUP); //GoButton
  digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
  digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);

  /*
     COPY AND PASTE BELOW FOR DUPLICATING UP
  */
  pinMode(STATIONTWOpins[0], OUTPUT); //RedLED
  pinMode(STATIONTWOpins[1], OUTPUT); //GreenLED
  pinMode(STATIONTWOpins[2] , INPUT_PULLUP); //AcknowledgeButton
  pinMode(STATIONTWOpins[3] , INPUT_PULLUP); //StandbyButton
  pinMode(STATIONTWOpins[4] , INPUT_PULLUP); //GoButton
  digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
  digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);


  /*
      MASTER BUTONS ETC.
  */
  pinMode(standbyMaster , INPUT_PULLUP);
  pinMode(GOMaster , INPUT_PULLUP);

  Serial.print("ONLINE");
}
void loop() {
  unsigned long currentMillis = millis(); //Current time in milliseconds (resets after 50 days)

  // GO BUTTON LOGIC FOR MASTER
  if (digitalRead(GOMaster) == LOW && masterButtonStates[0] == false && (currentMillis - masterButtonLastPress[0]) >= debounceTime) {
    masterButtonStates[0] = true;
    //GO button pressed for master
    if (STATIONONEgreenLEDState == HIGH || STATIONTWOgreenLEDState == HIGH) {
      STATIONONEgreenLEDState = LOW;
      digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);

      STATIONTWOgreenLEDState = LOW;
      digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);
    } else {
      STATIONONEgreenLEDState = HIGH;
      digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);

      STATIONTWOgreenLEDState = HIGH;
      digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);

      //Turn off any standbys
      STATIONONEredLEDState = LOW;
      STATIONONEredLEDFlash = false;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);

      STATIONTWOredLEDState = LOW;
      STATIONTWOredLEDFlash = false;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    }


  } else if (digitalRead(GOMaster) == HIGH && masterButtonStates[0] == true) { //Reset it if it's been released
    masterButtonStates[0] = false;
    masterButtonLastPress[0] = currentMillis; //The debouncing - set to 200ms atm
  }

  // STANDBY BUTTON LOGIC FOR MASTER CHANNEL
  if (digitalRead(standbyMaster) == LOW && masterButtonStates[1] == false && (currentMillis - masterButtonLastPress[1]) >= debounceTime) {
    masterButtonStates[1] = true;

    if (STATIONONEredLEDState == HIGH || STATIONTWOredLEDState == HIGH || STATIONONEredLEDFlash || STATIONTWOredLEDFlash) {
      STATIONONEredLEDState = LOW; //Turn off LEDs
      STATIONONEredLEDFlash = false;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);

      STATIONTWOredLEDState = LOW;
      STATIONTWOredLEDFlash = false;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    } else {
      STATIONONEredLEDFlash = true; //Make em flash
      STATIONTWOredLEDFlash = true;

      
      //Turn off GreenLEDs if they're on
      STATIONONEgreenLEDState = LOW;
      digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);
      STATIONTWOgreenLEDState = LOW;
      digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);
   
    }
  } else if (digitalRead(standbyMaster) == HIGH && masterButtonStates[1] == true) { //Reset it if it's been released
    masterButtonStates[1] = false;
    masterButtonLastPress[1] = currentMillis; //The debouncing - set to 200ms atm
  }


  /*
    DUPLICATE THE BELOW FOR EACH OUT STATION
  */
  //  FLASH LOGIC       If the red led should be flashing give it a good old flash if needed
  if (STATIONONEredLEDFlash) {
    if (currentMillis - STATIONONEflashTimer >= flashInterval) {
      STATIONONEflashTimer = currentMillis;
      if (STATIONONEredLEDState == LOW) {
        STATIONONEredLEDState = HIGH;
      } else {
        STATIONONEredLEDState = LOW;
      }
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    }
  }
  //  END FLASH LOGIC

  // GO BUTTON LOGIC FOR EACH CHANNEL
  // BOX 1
  if (digitalRead(STATIONONEpins[4]) == LOW && STATIONONEbuttonStates[2] == false && (currentMillis - STATIONONEbuttonLastPress[2]) >= debounceTime) {
    STATIONONEbuttonStates[2] = true;
    //GO button pressed for that channel
    STATIONONEredLEDFlash = false;
    STATIONONEredLEDState = LOW;
    digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    if (STATIONONEgreenLEDState == LOW) {
      STATIONONEgreenLEDState = HIGH;
      digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);
    } else {
      STATIONONEgreenLEDState = LOW;
      digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);
    }
  } else if (digitalRead(STATIONONEpins[4]) == HIGH && STATIONONEbuttonStates[2] == true) { //Reset it if it's been released
    STATIONONEbuttonStates[2] = false;
    STATIONONEbuttonLastPress[2] = currentMillis; //The debouncing - set to 200ms atm
  }

  // STANDBY BUTTON LOGIC FOR EACH CHANNEL
  // BOX 1
  if (digitalRead(STATIONONEpins[3]) == LOW && STATIONONEbuttonStates[1] == false && (currentMillis - STATIONONEbuttonLastPress[1]) >= debounceTime) {
    STATIONONEbuttonStates[1] = true;
    //Standby button pressed for that channel
    if (STATIONONEredLEDFlash == false && STATIONONEredLEDState == HIGH) { //If they've activated their standby button to alert you
      STATIONONEredLEDState = LOW;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    } else if (STATIONONEredLEDFlash == false) { //If you want to stand them by
      STATIONONEgreenLEDState = LOW;
      digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);
      STATIONONEredLEDFlash = true;
    } else { //Cancelling a standby
      //STOP THE RED FLASHING - but be careful - when you do this you must turn off the LED as well otherwise it might be left on
      STATIONONEredLEDFlash = false;
      STATIONONEredLEDState = LOW;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    }
  } else if (digitalRead(STATIONONEpins[3]) == HIGH && STATIONONEbuttonStates[1] == true) { //Reset it if it's been released
    STATIONONEbuttonStates[1] = false;
    STATIONONEbuttonLastPress[1] = currentMillis; //The debouncing
  }

  // ACKNOWLEDGE BUTTON LOGIC FOR EACH CHANNEL
  // BOX 1
  if (digitalRead(STATIONONEpins[2]) == LOW && STATIONONEbuttonStates[0] == false && (currentMillis - STATIONONEbuttonLastPress[0]) >= debounceTime) {
    STATIONONEbuttonStates[0] = true;
    //ACK button pressed for that channel
    if (STATIONONEgreenLEDState == LOW && STATIONONEredLEDFlash) { //They are acknowledging a standby - make it red light
      STATIONONEredLEDState = HIGH;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    } else if (STATIONONEgreenLEDState == LOW && STATIONONEredLEDFlash == false && STATIONONEredLEDState == HIGH) { //They are turning their light off
      STATIONONEredLEDState = LOW;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    } else if (STATIONONEgreenLEDState == LOW && STATIONONEredLEDFlash == false) { //They are turning their light on
      STATIONONEredLEDState = HIGH;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);
    } else if (STATIONONEgreenLEDState == HIGH && STATIONONEredLEDFlash == false) { //They are turning out the go
      STATIONONEredLEDState = LOW;
      digitalWrite(STATIONONEpins[0], STATIONONEredLEDState);

      STATIONONEgreenLEDState == LOW;
      digitalWrite(STATIONONEpins[1], STATIONONEredLEDState);
    }
    STATIONONEredLEDFlash = false; //Stop any falshing anyhow

    //Turn off green
    STATIONONEgreenLEDState = LOW;
    digitalWrite(STATIONONEpins[1], STATIONONEgreenLEDState);
  } else if (digitalRead(STATIONONEpins[2]) == HIGH && STATIONONEbuttonStates[0] == true) { //Reset it if it's been released
    STATIONONEbuttonStates[0] = false;
    STATIONONEbuttonLastPress[0] = currentMillis; //The debouncing
  }

  /*
     FROM THIS SECTION ONWARDS EVERYTHING IS JUST DUPLICATED - PLEASE DO NOT EDIT DOWN HERE - JUST COPY AND PASTE FROM ABOVE AND PUT BELOW, CHANING ONE FOR TWO AND SO ON FOR EACH BOX YOU HAVE
  */
  //  FLASH LOGIC       If the red led should be flashing give it a good old flash if needed
  if (STATIONTWOredLEDFlash) {
    if (currentMillis - STATIONTWOflashTimer >= flashInterval) {
      STATIONTWOflashTimer = currentMillis;
      if (STATIONTWOredLEDState == LOW) {
        STATIONTWOredLEDState = HIGH;
      } else {
        STATIONTWOredLEDState = LOW;
      }
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    }
  }
  //  END FLASH LOGIC

  // GO BUTTON LOGIC FOR EACH CHANNEL
  // BOX 1
  if (digitalRead(STATIONTWOpins[4]) == LOW && STATIONTWObuttonStates[2] == false && (currentMillis - STATIONTWObuttonLastPress[2]) >= debounceTime) {
    STATIONTWObuttonStates[2] = true;
    //GO button pressed for that channel
    STATIONTWOredLEDFlash = false;
    STATIONTWOredLEDState = LOW;
    digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    if (STATIONTWOgreenLEDState == LOW) {
      STATIONTWOgreenLEDState = HIGH;
      digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);
    } else {
      STATIONTWOgreenLEDState = LOW;
      digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);
    }
  } else if (digitalRead(STATIONTWOpins[4]) == HIGH && STATIONTWObuttonStates[2] == true) { //Reset it if it's been released
    STATIONTWObuttonStates[2] = false;
    STATIONTWObuttonLastPress[2] = currentMillis; //The debouncing - set to 200ms atm
  }

  // STANDBY BUTTON LOGIC FOR EACH CHANNEL
  // BOX 1
  if (digitalRead(STATIONTWOpins[3]) == LOW && STATIONTWObuttonStates[1] == false && (currentMillis - STATIONTWObuttonLastPress[1]) >= debounceTime) {
    STATIONTWObuttonStates[1] = true;
    //Standby button pressed for that channel
    if (STATIONTWOredLEDFlash == false && STATIONTWOredLEDState == HIGH) { //If they've activated their standby button to alert you
      STATIONTWOredLEDState = LOW;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    } else if (STATIONTWOredLEDFlash == false) { //If you want to stand them by
      STATIONTWOgreenLEDState = LOW;
      digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);
      STATIONTWOredLEDFlash = true;
    } else { //Cancelling a standby
      //STOP THE RED FLASHING - but be careful - when you do this you must turn off the LED as well otherwise it might be left on
      STATIONTWOredLEDFlash = false;
      STATIONTWOredLEDState = LOW;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    }
  } else if (digitalRead(STATIONTWOpins[3]) == HIGH && STATIONTWObuttonStates[1] == true) { //Reset it if it's been released
    STATIONTWObuttonStates[1] = false;
    STATIONTWObuttonLastPress[1] = currentMillis; //The debouncing
  }

  // ACKNOWLEDGE BUTTON LOGIC FOR EACH CHANNEL
  // BOX 1
  if (digitalRead(STATIONTWOpins[2]) == LOW && STATIONTWObuttonStates[0] == false && (currentMillis - STATIONTWObuttonLastPress[0]) >= debounceTime) {
    STATIONTWObuttonStates[0] = true;
    //ACK button pressed for that channel
    if (STATIONTWOgreenLEDState == LOW && STATIONTWOredLEDFlash) { //They are acknowledging a standby - make it red light
      STATIONTWOredLEDState = HIGH;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    } else if (STATIONTWOgreenLEDState == LOW && STATIONTWOredLEDFlash == false && STATIONTWOredLEDState == HIGH) { //They are turning their light off
      STATIONTWOredLEDState = LOW;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    } else if (STATIONTWOgreenLEDState == LOW && STATIONTWOredLEDFlash == false) { //They are turning their light on
      STATIONTWOredLEDState = HIGH;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);
    } else if (STATIONTWOgreenLEDState == HIGH && STATIONTWOredLEDFlash == false) { //They are turning out the go
      STATIONTWOredLEDState = LOW;
      digitalWrite(STATIONTWOpins[0], STATIONTWOredLEDState);

      STATIONTWOgreenLEDState == LOW;
      digitalWrite(STATIONTWOpins[1], STATIONTWOredLEDState);
    }
    STATIONTWOredLEDFlash = false; //Stop any falshing anyhow

    //Turn off green
    STATIONTWOgreenLEDState = LOW;
    digitalWrite(STATIONTWOpins[1], STATIONTWOgreenLEDState);
  } else if (digitalRead(STATIONTWOpins[2]) == HIGH && STATIONTWObuttonStates[0] == true) { //Reset it if it's been released
    STATIONTWObuttonStates[0] = false;
    STATIONTWObuttonLastPress[0] = currentMillis; //The debouncing
  }


}