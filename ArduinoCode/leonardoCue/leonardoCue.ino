#include <Keyboard.h>

const unsigned int pins[] = {12,7,10,9,13,8,11,4};
int buttonsUpState[4];    
int buttonsLastState[4];
unsigned long buttonsLastDebounceTime[4]; //The last time each button was pressed
unsigned long buttonsHeldTime[4]; //How long button has been held for
int buttonsState[4];
const unsigned long buttonsDebounceDelay = 200; // How long to do a debounce check for
/*
 * 0  Go Button
 * 1  ACK Button
 * 2  Key Switch
 * 3  EStop/3rd Facepanel Button 
 * 
 * 4  Green LED
 * 5  Red LED
 * 6  3rd LED
 * 7  Case LED
 */

void buttonPressed(int i) {
  digitalWrite(pins[7], LOW);
  switch (i) {
    case 0: //Go button
      //Send space key
      Keyboard.press(32);
      digitalWrite(pins[4], HIGH);
      delay(30);
      Keyboard.release(32);
      digitalWrite(pins[4], LOW);
      break;
    case 1: //ACK Button
      //Send escape key
      digitalWrite(pins[5], HIGH);
      Keyboard.press(177);             
      delay(30);                 
      Keyboard.release(177);
      digitalWrite(pins[5], LOW);
      break;
    case 2: //Key switch - up arrow
      Keyboard.press(218);
      digitalWrite(pins[6], LOW);
      delay(10);
      Keyboard.release(218);
      digitalWrite(pins[6], HIGH);
      break;
    case 3: //3rd button - down arrow
      Keyboard.press(217);
      
      digitalWrite(pins[6], LOW);
      delay(10);
      Keyboard.release(217);
      digitalWrite(pins[6], HIGH);
      break;
  }
}
void buttonReleased(int i, unsigned long holdTime) { //holdTime is how long the button was held for before being released in Milliseconds
  digitalWrite(pins[7], HIGH);
}
void setup() {
  Keyboard.begin();
  int i;
  for (i = 0; i < 4; i = i + 1) {
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
  pinMode(pins[7], OUTPUT);
  digitalWrite(pins[4], HIGH);
  digitalWrite(pins[5], HIGH);
  digitalWrite(pins[6], HIGH);
  digitalWrite(pins[7], HIGH);
  delay(100);
  digitalWrite(pins[4], LOW);
  digitalWrite(pins[5], LOW);
}

void loop() {
  //Buttons 
  int i;
  for (i = 0; i < 4; i = i + 1) {
    if (digitalRead(pins[i]) != buttonsState[i] && (millis() - buttonsLastDebounceTime[i]) > buttonsDebounceDelay) { //Button has changed
      if (digitalRead(pins[i]) != buttonsUpState[i]) {
        buttonPressed(i); //Call a function if it's been pressed
        buttonsHeldTime[i] = millis(); //Track when it was pressed - so we can give an indication to the release function of how long it was held for
      } else {
        buttonReleased(i, (millis() - buttonsHeldTime[i])); //Call a function if it's been released
      }
      buttonsState[i] = digitalRead(pins[i]);
      buttonsLastDebounceTime[i] = millis(); // reset the debouncing timer for that particular button
    }
  }
}
