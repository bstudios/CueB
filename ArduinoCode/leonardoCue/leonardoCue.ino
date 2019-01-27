#include <Keyboard.h>

const unsigned int pins[] = {12,7,10,9,13,8,11};
int buttonsUpState[4];    
int buttonsLastState[4];
unsigned long buttonsLastDebounceTime[4]; //The last time each button was pressed
unsigned long buttonsHeldTime[4]; //How long button has been held for
int buttonsState[4];
const unsigned long buttonsDebounceDelay = 20; // How long to do a debounce check for
/*
 * 0  Go Button
 * 1  ACK Button
 * 2  Key Switch
 * 3  EStop/3rd Facepanel Button 
 * 
 * 4  Green LED
 * 5  Red LED
 * 6  3rd LED
 * 
 */

void buttonPressed(int i) {
  switch (i) {
    case 0: //Go button
      //Send space key
      Keyboard.press(32);
      delay(30);
      Keyboard.release(32);
      break;
    case 1: //ACK Button
      //Send escape key
      Keyboard.press(177);             
      delay(30);                 
      Keyboard.release(177);
      break;
    case 2: //Key switch
      //Do nothing
      break;
    case 3: //3rd button
      //Do nothing
      Keyboard.press(33);
      delay(30);
      Keyboard.release(33);
      break;
  }
}
void buttonReleased(int i, unsigned long holdTime) { //holdTime is how long the button was held for before being released in Milliseconds

}
void setup() {
  Keyboard.begin();
  int i;
  for (i = 0; i < 3; i = i + 1) {
    pinMode(pins[i], INPUT_PULLUP);
    buttonsUpState[i] = digitalRead(pins[i]);
    buttonsLastState[i] = digitalRead(pins[i]);
    buttonsState[i] = digitalRead(pins[i]);
    buttonsLastDebounceTime[i] = 0;
    buttonsHeldTime[i] = millis();
  }
    
  pinMode(pins[4], OUTPUT);
  pinMode(pins[5], OUTPUT);
  pinMode(pins[6], OUTPUT);
  digitalWrite(pins[4], HIGH);
  digitalWrite(pins[5], HIGH);
  digitalWrite(pins[6], HIGH);
  
  delay(100);
  digitalWrite(pins[4], LOW);
  digitalWrite(pins[5], LOW);
  digitalWrite(pins[6], LOW);
}

void loop() {
  //Buttons 
  int i;
  for (i = 0; i < 3; i = i + 1) {
    //Handle the debouncing stuff for that button
    if (digitalRead(pins[i]) != buttonsLastState[i]) {
      buttonsLastDebounceTime[i] = millis(); // reset the debouncing timer for that particular button
      buttonsLastState[i] = digitalRead(pins[i]);
    }

    //Handle if it's actually been pressed for that button
    if ((millis() - buttonsLastDebounceTime[i]) > buttonsDebounceDelay && digitalRead(pins[i]) != buttonsState[i]) {
      if (digitalRead(pins[i]) != buttonsUpState[i]) {
        buttonPressed(i); //Call a function if it's been pressed
        buttonsHeldTime[i] = millis(); //Track when it was pressed - so we can give an indication to the release function of how long it was held for
      } else {
        buttonReleased(i, (millis() - buttonsHeldTime[i])); //Call a function if it's been released
      }
      buttonsState[i] = digitalRead(pins[i]);
    }
  }
}
