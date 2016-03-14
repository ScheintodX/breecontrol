#include <ESP8266WiFi.h>
#include <PubSubClient.h>          // https://github.com/Imroy/pubsubclient
#include <NeoPixelBus.h>           // https://github.com/Makuna/NeoPixelBus/tree/UartDriven
#include <Wire.h>
#include <Adafruit_ADS1015.h>      // https://github.com/adafruit/Adafruit_ADS1X15
#include "Timer.h"
#include <OneWire.h>

const char *ssid =  "braumeister";    // cannot be longer than 32 characters!
const char *password =  "braumeister";    //
const char* mqtt_server = "braumeister.griesbraeu";
const char* mqtt_username = "braumeister";
const char* mqtt_password = "braumeister";
const String MQTT_TOPIC_SUFFIX = "griesbraeu";
const String DEVNAME = "boiler1";
const String BASE = MQTT_TOPIC_SUFFIX + "/" + DEVNAME + "/";

#define SSR1_PIN 12
#define SSR2_PIN 13 
#define SSR3_PIN 14

#define OVERHEATING 350
#define R1_PT_SPIT 216.0
#define CHAN1 0
#define R2_PT_SPIT 221.0
#define CHAN2 1
#define Vmain 3363

volatile float temp_chan1 = -1000.0;
volatile float temp_chan2 = -1000.0;
volatile float upper_temp = 0.0;
volatile float lower_temp = 0.0;

volatile float temp = 0.0;
volatile bool aggitator = false;
volatile bool lid = false;


// Neopixel settings
#define PIXELS 12
NeoPixelBus ledstrip = NeoPixelBus(PIXELS, 4, NEO_GRB | NEO_KHZ800);
RgbColor colorsIn[PIXELS];
volatile int rgbMode = 0;


// 1wire
#define ONE_WIRE_BUS 16   // DS18B20 pin
OneWire onewire(ONE_WIRE_BUS);
uint8_t ds18b20_addr[8];  // temp sensor
uint8_t ds2408_addr[8];   // io chip


// i2c adc
Adafruit_ADS1115 ads;

// network
WiFiClient espClient;
PubSubClient client(espClient);

Timer t;

void _printHex(uint8_t* addr, uint8_t count, bool newline=0) {
  for (uint8_t i = 0; i < count; i++) {
    Serial.print(addr[i]>>4, HEX);
    Serial.print(addr[i]&0x0f, HEX);
  }
  if (newline)
    Serial.println();
}

char _b2int( const char c ) {
    if( c >= '0' && c <= '9' ) return c-'0';
    if( c >= 'A' && c <= 'F' ) return c-'A'+10;
    if( c >= 'a' && c <= 'f' ) return c-'a'+10;
    return 0; // just in case
}

int _hex2int( String s, int index ) {
    return (_b2int( s.charAt(index) )<<4) + _b2int(s.charAt(index+1));;
}

void _publish( const String topic, const String value ) {

  Serial.println( "PUB: " + topic + " = " + value );

  client.publish( (BASE + topic).c_str(), value.c_str() );
}

void gotMessage(const MQTT::Publish& pub) {

  Serial.println( "RECV: " + pub.topic() + " = " + pub.payload_string() );

  String s_pl = String(pub.payload_string());
  String topic = String(pub.topic());
  int payload_len = pub.payload_len();

  if(String(topic) == (BASE+"upper/temp/set")) {

    if( s_pl.toFloat() < OVERHEATING ){
      upper_temp = s_pl.toFloat();
    }
   
  } else if(String(topic) == (BASE+"lower/temp/set")) {
   
    if( s_pl.toFloat() < OVERHEATING ){
      lower_temp = s_pl.toFloat();
    }
 
  } else if(String(topic) == (BASE+"aggitator/set")) {

    if( s_pl == "1" ){
      aggitator = true;
    }else{
      aggitator = false;
    }
  
  } else if(String(topic) == (BASE+"indicator/color/set")) {

   if ( payload_len != PIXELS * 3 * 2 ) return;

    for( int i = 0; i < PIXELS; i++ ) {

      colorsIn[ i ].R = _hex2int( s_pl, i*3*2 + 0*2 );
      colorsIn[ i ].G = _hex2int( s_pl, i*3*2 + 1*2 );
      colorsIn[ i ].B = _hex2int( s_pl, i*3*2 + 2*2 );
    }
    Serial.println( "set color" );
  
  }else if(String(topic) == (BASE+"indicator/mode/set")){
    if ( s_pl == "rotate" ) {
      rgbMode = 1;
    } else if ( s_pl == "fade" ) {
      rgbMode = 2;
    } else { //default show
      rgbMode = 0;
    }
  }
}


void reconnect() {
  
  while (!client.connected()) {
  
    Serial.print("Attempting MQTT connection...");
    
    // Attempt to connect
    if (client.connect(MQTT::Connect(("ESP8266Client_"+BASE).c_str())
        .set_auth(mqtt_username, mqtt_password))) {
      
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.set_callback(gotMessage);
      //client.subscribe((BASE+"/#").c_str()); 
      client.subscribe(MQTT::Subscribe()
                  .add_topic(( BASE + "indicator/#").c_str())
                  .add_topic(( BASE + "upper/temp/set" ).c_str())
                  .add_topic(( BASE + "lower/temp/set" ).c_str())
                  .add_topic(( BASE + "aggitator/set" ).c_str()));
  
      Serial.println("MQTT connected");  
    
    } else {
     
      Serial.print("failed, rc=");
      Serial.println(" try again in 1 seconds");
      // Wait 5 seconds before retrying
      delay(1000);
    } 
  }
}


float calcJacketTemp( int chan, float Rserial ){
  
  int16_t results;
  
  float multiplier = 0.125;
  if( chan == 0 ){
    results = ads.readADC_Differential_0_1();
  }else{
    results = ads.readADC_Differential_2_3();
  }
  float Vpt = results * multiplier;
    
  //Serial.print("Differential: "); Serial.print(results); Serial.print("("); Serial.print(Vpt); Serial.println("mV)");
  float Ipt = (Vmain-Vpt)/Rserial;
  float Rpt = Vpt/Ipt;
  //Serial.println(Rpt);
 
  return 3383.81-0.287154*sqrt(159861899.0-210000.0*Rpt);
}


void doCalcJacketTemp(){
  temp_chan1 = calcJacketTemp(CHAN1,R1_PT_SPIT);
  if( temp_chan1 < lower_temp ){
    digitalWrite(SSR1_PIN, HIGH);
    _publish( "lower/heater/status", "1" );
  }else{
    digitalWrite(SSR1_PIN, LOW);
    _publish( "lower/heater/status", "0" );
  }
  //Serial.print("lower: "); Serial.print(temp_chan1); Serial.println("°C");
  _publish( "lower/temp/status", String(temp_chan1) );
  
  temp_chan2 = calcJacketTemp(CHAN2,R2_PT_SPIT);
  if( temp_chan2 < upper_temp ){
    digitalWrite(SSR2_PIN, HIGH);
    _publish( "upper/heater/status", "1" );
  }else{
    digitalWrite(SSR2_PIN, LOW);
    _publish( "upper/heater/status", "0" );
  }
  //Serial.print("upper: "); Serial.print(temp_chan2); Serial.println("°C");
  _publish( "upper/temp/status", String(temp_chan2) );
  
}


void doEnumerate1wire(){
  
  uint8_t addr[8];

  ds18b20_addr[0] = 0;
  ds2408_addr[0] = 0;

  while( onewire.search( addr )) {

    if (OneWire::crc8(addr, 7) != addr[7]) {
        Serial.println("CRC is not valid!");
        continue;
    }

    switch( addr[0] ){
      case 0x28: memcpy( ds18b20_addr, addr, 8 ); break;
      case 0x29: memcpy( ds2408_addr, addr, 8 ); break;
      default: Serial.print( "unknown 1wire: " ); _printHex( addr, 8, true );
    }
  }

  onewire.reset_search();
  
  //delay(250);
}


void doBoilerTemp( uint8_t * addr ){
  
  uint8_t i;
  uint8_t data[12];
  float celsius;
  int raw;

  //Serial.print("Chip = DS18B20 (temp) ");
  //_printHex( addr, 8, true );

  onewire.reset();
  onewire.select(addr);    
  onewire.write(0xBE);         // Read Scratchpad

  onewire.read_bytes( data, 9 );

  //Serial.print("  Data = ");
  //_printHex( data, 9 );
  //Serial.print(" CRC=");
  //Serial.print(OneWire::crc8(data, 8), HEX);
  //Serial.println();

  // Convert the data to actual temperature
  // because the result is a 16 bit signed integer, it should
  // be stored to an "int16_t" type, which is always 16 bits
  // even when compiled on a 32 bit processor.
  raw = (data[1] << 8) | data[0];

  celsius = (float)raw / 16.0;

  //Serial.print("  Temperature = ");
  //Serial.print(celsius);
  //Serial.println("° C, ");

  // Start conversion after reading so it's ready next run
  onewire.reset();
  onewire.select(addr);
  onewire.write(0x44, 1);        // start conversion, with parasite power on at the end
  
  //delay(1000);     // maybe 750ms is enough, maybe not
  // we might do a onewire.depower() here, but the reset will take care of it.

  if( data[0] == 0x50 && data[1] == 0x05 ) return;
  
  _publish( "temp/status", String(celsius) );
}

void doBoilerFill( uint8_t * addr ){

  uint8_t stat;
  float fill;

  onewire.reset();
  onewire.select(addr);
  
  uint8_t buf[13];  // Put everything in the buffer so we can compute CRC easily.
  buf[0] = 0xF0;    // Read PIO Registers
  buf[1] = 0x88;    // LSB address
  buf[2] = 0x00;    // MSB address
  onewire.write_bytes(buf, 3);
  onewire.read_bytes(buf+3, 10);     // 3 cmd bytes, 6 data bytes, 2 0xFF, 2 CRC16
  onewire.reset();

  if (!OneWire::check_crc16(buf, 11, &buf[11])) {
    Serial.print("CRC failure in DS2408 at ");
    _printHex(addr, 8, true);
    return;
  }


  stat = buf[ 3 ];

  Serial.println( "===" + String( stat ) + "===" );

  _publish( "lid/status", (stat & 0x80) == 0 ? "1" : "0" ); //1

  if( (stat & 0x40) == 0 ) fill = 1.0;                      //2
  else if( (stat & 0x20) == 0 ) fill = 0.6;                 //3
  else if( (stat & 0x10) == 0 ) fill = 0.3;                 //4
  else fill = 0;

  _publish( "fill/status", String( fill ) );

}

void do1wire(){

  doEnumerate1wire();
  //delay( 250 );
  if( ds18b20_addr[ 0 ] ) doBoilerTemp( ds18b20_addr );
  if( ds2408_addr[ 0 ] ) doBoilerFill( ds2408_addr );
  
}

int rotate = 0;
int fade = 0;
bool up=true;

void colorwheeler( int rgbmode ) {

  RgbColor tmp;

  switch ( rgbmode ) {

    case 0:
      for (int i = 0; i < PIXELS; i++) {
        ledstrip.SetPixelColor( i, colorsIn[ i ] );
      }
      break;

    case 1:
      rotate = (rotate-1);
      if( rotate < 0 ) rotate = PIXELS-1;
      for (int i = 0; i < PIXELS; i++) {
        ledstrip.SetPixelColor( i, colorsIn[ (i+rotate)%PIXELS ] );
      }
      break;

    case 2:
      if( up ) {
        fade += 16;
        if( fade > 231 ) {
          fade = 231  ;
          up = false;
        }
      } else {
        fade -= 16;
        if( fade < 0 ) {
          fade = 0;
          up = true;
        }
      }
      for( int i = 0; i < PIXELS; i++ ) {
        tmp.R = colorsIn[ i ].R;
        tmp.G = colorsIn[ i ].G;
        tmp.B = colorsIn[ i ].B;
        tmp.Darken( fade );
  
        ledstrip.SetPixelColor( i, tmp );
      }

      break;
   
    default: break;
  }

  ledstrip.Show();

}

void doRGB(){
  colorwheeler( rgbMode );
}

void doNominal(){
  
   _publish( "upper/temp/nominal", String(upper_temp) );
   _publish( "lower/temp/nominal", String(lower_temp) );
   _publish( "aggitator/nominal", aggitator ? "1" : "0" );
   
}

void doIO(){

   if( lid && aggitator ){
     digitalWrite(SSR3_PIN, HIGH);
     _publish( "aggitator/status", "1" );
   }else{
     digitalWrite(SSR3_PIN, LOW);
     _publish( "aggitator/status", "0" );
   }  
}



// ========== START / SETUP ============


void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}


void startLedstrip(){

  ledstrip.Begin();
  ledstrip.SetPixelColor(0, RgbColor(255,0,0));
  ledstrip.Show();

  for ( int i = 0; i < PIXELS; i++ ) {

    colorsIn[ i ].R = i * 4;
    colorsIn[ i ].G = 0;
    colorsIn[ i ].B = i * 2;
  }
}

void startSerial(){

  // Setup console
  Serial.begin(115200);
  delay(10);
  Serial.println( "HELLO WORLD!" );
  Serial.println();
}

void startI2C(){
  Wire.begin(5,4);
  ads.setGain(GAIN_ONE);
  ads.begin();
}

void startSSR(){
  
  pinMode(SSR1_PIN, OUTPUT);
  digitalWrite(SSR1_PIN, LOW);
  
  pinMode(SSR2_PIN, OUTPUT);
  digitalWrite(SSR2_PIN, LOW);
  
  pinMode(SSR3_PIN, OUTPUT);
  digitalWrite(SSR3_PIN, LOW);
}

void startCalcJacketTemp() {
  t.every(2000, doCalcJacketTemp);
}

void startUpdateNominal(){
  t.every(5000, doNominal);
}

void startIO(){
  t.every(1000, doIO);
}

void startRGB(){
  t.every(100, doRGB);
}

void start1wire(){
  t.every( 2000, do1wire );
}

void setup() {

  startSSR();

  startSerial();

  startLedstrip();

  startI2C();

  setup_wifi();

  client.set_server(mqtt_server, 1883);

  t.after( 10, startRGB );
  t.after( 20, startIO );
  t.after( 40, startCalcJacketTemp );
  t.after( 60, startUpdateNominal );
  t.after( 90, start1wire );
}

void loop() {

  if(!client.connected()){
    Serial.println(client.connected());
    Serial.println( "reconnect" );
    reconnect();
  }
  
  client.loop();
  
  t.update();
}

