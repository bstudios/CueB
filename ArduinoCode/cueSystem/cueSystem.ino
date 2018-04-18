// IMPORTS FOR RFID
#include <deprecated.h>
#include <MFRC522.h>
#include <MFRC522Extended.h>
#include <require_cpp11.h>

// IMPORTS FOR TEMPERATURE SENSOR
#include <Wire.h>
#include <Adafruit_HTU21DF.h>

//  IMPORTS FOR SCREEN
#include <LiquidCrystal_I2C.h> //Include the exact library in a zip that's included with this project source


//  SETUP
//      RFID     
#define SS_PIN 53
#define RST_PIN 5
MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance.
//      TEMPERATURE
Adafruit_HTU21DF htu = Adafruit_HTU21DF();
//      SCREEN
LiquidCrystal_I2C lcd(0x3F, 2, 1, 0, 4, 5, 6, 7, 3, POSITIVE); //Be sure to run this screen at 5V - it's rubbish at 3.3V


//  FUNCTIONS
//      BUTTONS
//      LIGHTS
//      SCREEN
void writeToScreen(String text, bool clearLCD) {
  if (clearLCD || text.length()>15) {
    lcd.clear();
  }
  if (text.length()>16) { //If string too long for system print an error
    text = "STRING TOO LONG";
  }
  lcd.print(text);
}

void setup() {
  // SETUP
  //    SERIAL
  Serial.begin(9600);
  //    SCREEN
  lcd.begin(16,2);          
  lcd.setBacklight(LOW); // This LCD is absolutley useless without the backlight on - but flashing it might be useful at some point
  lcd.home ();                   // go home
  lcd.print("   TIMEKEEPER   ENTER PROJECT ID");
  lcd.setBacklight(HIGH); // This LCD is absolutley useless without the backlight on - but flashing it might be useful at some point
  //    TEMPERATURE SENSOR  
  SPI.begin();
  if (!htu.begin()) {
    writeToScreen("Couldn't find sensor!",true);
    while (1);
  }
  
  //    RFID
  mfrc522.PCD_Init(); // Init MFRC522 card


  pinMode(12, INPUT);
  Serial.println("ON");
}


void loop() {
  writeToScreen("Temp: " + (String(htu.readTemperature())), true);
  //writeToScreen("\t\tHum: "); writeToScreen(String(htu.readHumidity()));


  // Look for new cards
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Dump debug info about the card. PICC_HaltA() is automatically called.
  mfrc522.PICC_DumpToSerial(&(mfrc522.uid));
  
  if (digitalRead(12)== HIGH) {
    Serial.println("HIGH");
  } else {
    Serial.println("LOW");
  }
  
  
  delay(10000);
}
