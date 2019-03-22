/*
*************************************** WATER RESOURCE FIRMWERE *************************************
* 
*In order for this program to be compiled you need to initially install in the arduino IDE 
*the dependencies of the ESP32 platform, and the WiFi, WifiManager and ArduinoJson libraries.
*
*This program is designed to work using the platform of ESP32, if you wanted to test it on another 
*platform, the changes and checks of operation is the responsibility of the developer
*
*Attention must be paid to the configuration and gatewayComunication functions, both must be configured 
*with the URLs of the routes where the configured server is to receive the information and respond to the 
*settings for the ESP
*/

#include "ArduinoJson-v5.13.4.h"
#include "filtrosDigitais.h"

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <math.h>

//#define urlConfiguration    "http://192.168.100.3:3333/gateway/configuration"
//#define urlComunication     "http://192.168.100.3:3333/gateway/nivel"
#define urlConfiguration    "https://waterresource.hopto.org/backend/gateway/configuration"
#define urlComunication     "https://waterresource.hopto.org/backend/gateway/nivel"
#define NETWORK_NAME        "WaterResource"
#define NEWTWORK_PASS       "12345678"
#define JSON_BUF_SIZE       256
#define us_TO_minute        60000000
#define us_TO_seconds       1000000
#define ADC_SAMPLING        100

//Externals Inputs
#define PIN_IN_CONFIG_WIFI  22
//External Outputs
#define PIN_OUT_WIFI_OFF    02
#define PIN_OUT_PUMP_TOGGLE 18

//User Id must be configured according to the id of the user registered in the database
#define userId              1

FPB fpb;

float currentNivel = 0;

esp_sleep_wakeup_cause_t wakeup_reason;

//Variables RTC - Configuration Variables
//When using the deep sleep function only the RTC variables keep the values saved when the micro sleeps
RTC_DATA_ATTR int   timerAquisition = 5;
RTC_DATA_ATTR float aMin = 0.5;
RTC_DATA_ATTR int   aMax = 2;
RTC_DATA_ATTR float cxB = 0.58;
RTC_DATA_ATTR float cxC = 1.24;
RTC_DATA_ATTR float cxE = 0.95;
RTC_DATA_ATTR int   isPumpConfigured = 0;
RTC_DATA_ATTR int   isPumpBlocked=0;

RTC_DATA_ATTR bool  isPumpOff = true;
RTC_DATA_ATTR bool  isPumpOn = false;

RTC_DATA_ATTR bool  Flag = false;

RTC_DATA_ATTR float oldNivel = 0;

/*
 ******************************************* FUNCTIONS *********************************************** 
*/

/*****************************************************************************************************/
void readNivel()
{
  /*
  *This function is responsible to read adc input from the level sensor, applies a digital filter topology
  *calculate the current nivel and saved this current nivel in the global variable currentNivel
  */
    int adcReading = 0; 
    float adcMedia = 0;
    int minAdc = 196; //sets the min value read from the sensor in the adc port
    int maxAdc = 400;//sets the max value read from the sensor in the adc port

    //Enviorment Variables for calculate the nivel
    float h = 0;
    float R = 0;
    float r = 0;
    float pi = 3.14;
    float V = 0;
    float Vmax = 0;
    currentNivel = 0;
    
    //Get 100 readings for adc port
    for (int i = 0; i < 100; i++)
    {
        adcReading += fpb.retValue(analogRead(A0));
    }
    adcMedia = adcReading / 100; //Does the average
    Serial.print("Adc: ");
    Serial.print(adcMedia);
    
    h = ((adcMedia - minAdc) / (maxAdc - minAdc) * cxB); //Calculate the height
    R = cxC / 2; // calculate the ray
    r = cxE / 2; // calculate the ray
    V = ((pi * h) / (R - r)) * (pow(R, 3) - pow(r, 3)) * (0.33); //Calculate the volume in m³

    Serial.print(" - Nivel: ");
    Serial.print(V);
    Serial.print("m³");

    Vmax = ((pi * cxB) / (R - r)) * (pow(R, 3) - pow(r, 3)) * (0.33333333333); //Calculate the max volume in m³
    currentNivel = ( (100 * V) / Vmax ); //Clculates the current absolute volume in %

    Serial.print(" - Nivel Relativo: ");
    Serial.print(currentNivel);
    Serial.println("%");
}
/*****************************************************************************************************/
void configModeCallback(WiFiManager *myWiFiManager)
{
  /*
  * This Callback functions configured for WiFiManager operation
  */
    Serial.println("Entered config mode");
    Serial.println(WiFi.softAPIP());
    Serial.println(myWiFiManager->getConfigPortalSSID());
}
/*****************************************************************************************************/
void saveConfigCallback()
{
  /*
  * This Callback functions configured for WiFiManager operation
  */
    Serial.println("Configuração salva");
}
/*****************************************************************************************************/
void wifiConection()
{
  /*
  * This function is responsible for connecting ESP to WiFi already registered
  * if not wifi configured this generation the WifiManger API
  */
    WiFiManager wifiManager;

    wifiManager.setAPCallback(configModeCallback);
    wifiManager.setSaveConfigCallback(saveConfigCallback);
    wifiManager.autoConnect(NETWORK_NAME, NEWTWORK_PASS);
}
void Started_WiFiManager()
{
  /*
  * This function is responsible for connecting Generate WifiManager API
  */
    digitalWrite(PIN_OUT_WIFI_OFF, HIGH);
    WiFiManager wifiManager;
    if (!wifiManager.startConfigPortal(NETWORK_NAME, NEWTWORK_PASS))
    {
        Serial.println("Falha ao conectar");
        delay(2000);
        ESP.restart();
    }
}
/*****************************************************************************************************/

String creatJsonObject(int action)
{
  /*
  * This function is responsible generate json object and return it
  * Input: action: type int
  * Output: postData: type JsonObjectString
  */
    StaticJsonBuffer<JSON_BUF_SIZE> jsonBuffer;
    JsonObject &jsonData = jsonBuffer.createObject();
    JsonObject &LcGityAbhtppppeWihjAyYy = jsonData.createNestedObject("LçGityAbhtppppeWihjAyYy");
    JsonObject &WaterResource = LcGityAbhtppppeWihjAyYy.createNestedObject("WaterResource");

    String postData = "";

    switch (action)
    {
    case 1: //Initial Configuration
        WaterResource["userId"] = userId;
        break;

    case 2: //Normal Operation
        WaterResource["userId"] = userId;
        WaterResource["nivel"] = roundf(currentNivel * 100) / 100; //rounds the nivel to two decimal places
        WaterResource["isPumpBlocked"] = isPumpBlocked;
        break;

    default:
        break;
    }
    jsonData.printTo(postData);
    return postData;
}
/*****************************************************************************************************/

String HttpPost(String postBody, String URL)
{
  /*
  * This function is responsible for performing http request of the type Post, and return the server response
  * Input: postBody: type JsonObjectString, URL: type String
  * Output: response: type String
  */
    HTTPClient http;
    http.begin(URL);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(postBody);

    if (httpResponseCode == 200)
    {
        String response = http.getString();
        http.end();
        return response;
    }
    else
    {
        String response = http.getString();
        http.end();
        return "500";
    }
}
/*****************************************************************************************************/

void configuration()
{
  /*
  * This function is responsible for configurate the Environment system variables
  */
    StaticJsonBuffer<JSON_BUF_SIZE> jsonBufferConfiguration; //Make the Json Object
    String responsePost;
    int action = 1;

    responsePost = HttpPost(creatJsonObject(action), urlConfiguration); //Performs the post on the configured route and stores the response 
    //from the server

    if (responsePost.equals("500"))
    {
        Serial.println("HTTP ERROR");
        return;
    }

    JsonObject &jsonConfigure = jsonBufferConfiguration.parseObject(responsePost);
    
    //Set the Environment system variables
    timerAquisition = jsonConfigure.get<int>("aquisition");
    aMin = jsonConfigure.get<float>("aMin");
    aMax = jsonConfigure.get<int>("aMax");
    cxB = jsonConfigure.get<float>("cxB");
    cxC = jsonConfigure.get<float>("cxC");
    cxE = jsonConfigure.get<float>("cxE");
    isPumpConfigured = jsonConfigure.get<int>("isPumpConfigured");
    isPumpBlocked = jsonConfigure.get<int>("isPumpBlocked");
}
/*****************************************************************************************************/

void gatewayComunication()
{
  /*
  * This function is responsible for sending the currentNivel and bomb status to database
  */
    StaticJsonBuffer<JSON_BUF_SIZE> jsonBufferComunication; //Make the Json Object
    int action = 2;
    String responsePost;

    responsePost = HttpPost(creatJsonObject(action), urlComunication);//Performs the post on the configured route and stores the response 
    //from the server

    if (responsePost.equals("500"))
    {
        Serial.println("HTTP ERROR");
        return;
    }

    JsonObject &jsonResponse = jsonBufferComunication.parseObject(responsePost);
    
    //Set the Environment system variables
    timerAquisition = jsonResponse.get<int>("aquisition");
    aMin = jsonResponse.get<float>("aMin");
    aMax = jsonResponse.get<int>("aMax");
    cxB = jsonResponse.get<float>("cxB");
    cxC = jsonResponse.get<float>("cxC");
    cxE = jsonResponse.get<float>("cxE");
    isPumpConfigured = jsonResponse.get<int>("isPumpConfigured");
    isPumpBlocked = jsonResponse.get<int>("isPumpBlocked");
    
    //If at any time the pump was blocked
    if (isPumpConfigured == 1)
    {
        if (isPumpBlocked == 1)
        {
            Serial.println("Pump Bloqued");
            digitalWrite(PIN_OUT_PUMP_TOGGLE, HIGH);
            delay(10);
            isPumpOn = false;
            isPumpOff = true;
        }
        else
        {
            Serial.println("Pump Not BLoqued");
        }
    }
    else
    {
        Serial.println("Pump not Configured");
    }
    
    //Set read-write amortization
    if(currentNivel>70)
    {
        timerAquisition = timerAquisition*aMax;
    }
    else if(currentNivel<40)
    {
        timerAquisition = timerAquisition*aMin;
    }
}
/*****************************************************************************************************/

void setup()
{
    Serial.begin(115200);
    
    //Set GPIO
    pinMode(PIN_OUT_WIFI_OFF, OUTPUT);
    pinMode(PIN_OUT_PUMP_TOGGLE, OUTPUT);

    //Set resolution Adc
    analogReadResolution(10); 
    fpb.setAlpha(0.9);

    //Started Wifi Aplications
    wifiConection();
    
    //Configure Deep Sleep Mode for two case, timer and external interruption on Pin 39
    //The function Wakeup_reason return What interruption happened
    esp_sleep_enable_timer_wakeup(us_TO_minute * timerAquisition);
    esp_sleep_enable_ext0_wakeup(GPIO_NUM_39, 1);
    wakeup_reason = esp_sleep_get_wakeup_cause();

   //Configures the system with the database information only when the ESP is powered on
    if (!Flag)
    {
        Serial.println("Configuration....");
        configuration();
        Flag = true;
    }
}
/*****************************************************************************************************/

void loop()
{

    if (wakeup_reason == 2)//wekeup_reason happens when the external interrupt is generated, and started WifiManger API
    {
        Started_WiFiManager();
    }

    if (WiFi.status() == WL_CONNECTED)//If the ESP are connected to the WiFi
    {
        readNivel();
        //////////////////// > 70% ////////////////////
        if (currentNivel > 70)
        {
            //If you do not have a pump set up for operation
            if (isPumpConfigured == 0)
            {
                Serial.println(">70 - Without Pump Configured");
                gatewayComunication();
            }
            
            //If you have a pump configured
            else
            {
                Serial.println(">70 - Whit Pump Configured");
                if (isPumpBlocked == 0)
                { //Check if the pump is blocked
                    if (isPumpOn)
                    { //Check if the pump is switched on
                        digitalWrite(PIN_OUT_PUMP_TOGGLE, HIGH);
                        Serial.println("Pump Off");
                        isPumpOn = false;
                        isPumpOff = true;
                        oldNivel = currentNivel;
                        gatewayComunication();
                    }
                    else if (isPumpOff)
                    {
                        oldNivel = currentNivel;
                        gatewayComunication();
                    }
                }
                else
                { //If the pump is blocked
                    oldNivel = currentNivel;
                    gatewayComunication();
                }
            }
            Serial.printf("Sleeping");
            esp_deep_sleep_start();
        } //End Nivel > 70

        ////////////////// > 40 && < 70% ////////////////////
        else if (currentNivel > 40 && currentNivel < 70)
        {
            //If you do not have a pump set up for operation
            if (isPumpConfigured == 0)
            {
                Serial.println(">40 && <70 - Without Pump Configured");
                gatewayComunication();
            }
            
            //If you have a pump configured
            else
            {
                Serial.println(">40 &&  <70 - With Bomba Configured");
                if (isPumpOn)
                { //Check that the pump is on
                    if (currentNivel <= oldNivel)
                    { //Checks the system condition with possible refueling failure
                        digitalWrite(PIN_OUT_PUMP_TOGGLE, HIGH);
                        Serial.println("Pump Off");
                        oldNivel = currentNivel;
                        isPumpBlocked = 1;
                        gatewayComunication();
                    }
                    else
                    {
                        oldNivel = currentNivel;
                        gatewayComunication();
                    }
                }

                else if (isPumpOff)
                { //check if the pump is switched off
                    if (isPumpBlocked == 0)
                    { //check if the pump has been switched off by some problem with the refueling system
                        oldNivel = currentNivel;
                        gatewayComunication();
                    }
                    else
                    {
                        oldNivel = currentNivel;
                        gatewayComunication();
                    }
                }
            }
            Serial.printf("Sleeping");
            esp_deep_sleep_start();
        } //End Nivel >40 && <70

        ///////////////////////////// <40 //////////////////////////////////////
        else if (currentNivel < 40)
        {
            //If you do not have a pump set up for operation
            if (isPumpConfigured == 0)
            {
                gatewayComunication();
            }

            //If you have a pump configured
            else
            { //If a pump is configured
                if (isPumpOff && isPumpBlocked == 0)
                { //If the pump is not already activated and is not blocked by an accident
                    digitalWrite(PIN_OUT_PUMP_TOGGLE, HIGH);
                    delay(10);
                    isPumpOff = false;
                    isPumpOn = true;
                    oldNivel = currentNivel;
                    gatewayComunication();
                    Serial.println("Pump On");
                }
                else if (isPumpOn)
                { //If the pump has been switched on
                    if (currentNivel <= oldNivel)
                    {   // If the current level is less than older level, so there is probably some problem in the system.
                        //so it blocks the pump, and assists a notification to the user.
                        isPumpBlocked = 1;
                        oldNivel = currentNivel;
                        gatewayComunication();
                        digitalWrite(PIN_OUT_PUMP_TOGGLE, HIGH);
                        Serial.println("Pump Off");
                        Serial.println("Pump Fail - Blocking the Pump");
                    }
                    else
                    {
                        oldNivel = currentNivel;
                        gatewayComunication();
                        Serial.println("Pump On -  Normalize Sistem");
                    }
                }
                else if (isPumpBlocked == 1)
                {   //If the pump is blocked it checks the current level to validate if the system has been reestablished
                    oldNivel = currentNivel;
                    gatewayComunication();
                    Serial.println("Pump Blocking");
                }
            }
            Serial.printf("Sleeping");
            esp_deep_sleep_start();
        } //End Nivel < 40
    } //End Wifi
} //End loop
