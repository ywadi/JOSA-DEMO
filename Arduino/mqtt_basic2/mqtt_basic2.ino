#include <SPI.h>
#include <YunClient.h>
#include <PubSubClient.h>
#include <Console.h>

int tempPin = 0;
float temp;
byte server[] = { 104, 40, 129, 254 };
unsigned long last = millis();


void callback(char* topic, byte* payload, unsigned int length) {
  // handle message arrived
  char command[length+1]; 
  for(int i=0; i<length; i++)
  {
     command[i] = payload[i];
  }
  command[length] = 0;
  Console.println(command);
  
  String com = command;
  if(com.equals("ON"))
  {
    Console.println("ON COMMAND");
    digitalWrite(13, HIGH);
  }
  else if(com.equals("OFF"))
  {
    Console.println("OFF COMMAND");
    digitalWrite(13, LOW);
  }
  else
  {}
  
}

YunClient ethClient;
PubSubClient client(server, 1883, callback, ethClient);

void setup()
{
  pinMode(13, OUTPUT);
  Bridge.begin();
  Console.begin();
  if (client.connect("arduinoClient")) {
    client.publish("outTopic", "hello world");
    client.subscribe("inTopic");
  }
}

void loop()
{
  client.loop();
  if (!client.connected())
  {
    if (client.connect("arduinoClient")) {
      client.subscribe("inTopic");
    }
  }
  temp = analogRead(tempPin);
  temp = temp * 0.48828125;
  String tempStr = String(temp);
  char tempString[15];
  tempStr.toCharArray(tempString, 15);
  if(millis() - last > 5000UL) {
    Console.print("TEMPRATURE = ");
    Console.print(temp);
    Console.print("*C");
    Console.println();
    if (client.connected())
    {
      client.publish("outTopic", tempString);
    }
    last = millis();
  }
  
  
}

