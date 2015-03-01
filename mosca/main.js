var mosca = require('mosca');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var lastRead;
var ascoltatore = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 6379,
  host: "localhost"
};

var moscaSettings = {
  port: 1883,
  backend: ascoltatore,
  persistence: {
    factory: mosca.persistence.Redis
  }
};

var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);     
});

// fired when a message is received
server.on('published', function(packet, client) {
	console.log('Published', decoder.write(packet.payload));
	if(packet.topic == "outTopic")
	{
		lastRead = decoder.write(packet.payload);
	}
});

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
}



var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('Welcome to my MQTT Server');
});


app.get('/command/:com', function(req, res){
        var newPacket = {
                topic: 'inTopic',
                payload: req.params.com,
                retain: false,
                qos: 0
        };
        server.publish(newPacket, function(){
		res.send("Done");
        });

});

app.get('/lastRead', function(req, res){
	res.send(lastRead+" °C");
});

app.listen(3000,function(){
        console.log("Express Server Ready on port 3000");
});

/*
var last = "ON";

setInterval(function(){
	var newPacket = {
		topic: 'inTopic',
		payload: last,
		retain: false,
		qos: 0
	};	
	server.publish(newPacket, function(){
		console.log("Published");
		if(last == "ON")
		{
			last = "OFF";
		}
		else
		{
			last = "ON";
		}
	});
},10000);
*/
