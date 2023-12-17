#!/usr/bin/node

import Mqtt from './mqtt.js';
var _mqtt = false;

const config = {
    client: "kilnsim",
    url: "mqtt://localhost:1883",
    username: "braumeister",
	password: '3oropMLRr7PvFpFEhHVijqDH',
	prefix: 'pottery/kiln/'
};

var Kiln = {
	temp: 20,
	powerfactor: 0,
	//door: true,
	heater: false
};

function gotMqttData( topic, value ){

    console.log( "<Q", topic, value );

    // Extracting the property name from the topic
    var t = topic.split( "/" ),
	    property = t[0];

    // Update the Kiln object and publish the new value
    if( Kiln.hasOwnProperty( property ) ){

		var currentType = typeof Kiln[property];

		if (currentType === "number") {
			Kiln[property] = Number(value);
		} else if (currentType === "boolean") {
			value = value.toString().toLowerCase();
			Kiln[property] = (value === 'true' || value === '1');
		} else {
			Kiln[property] = value;
		}
    }
}

function fmt( label, value, width=20 ){
	return (label + ': ' + value.toString()).padEnd(width, ' ');
}

function display() {

	console.log(
			`+----------------------+\n` +
			`| Kiln State           |\n` +
			`+----------------------+\n` +
			`| ${fmt('Temp', Kiln.temp + '°C' )} |\n` +
			`| ${fmt('Power', Kiln.powerfactor )} |\n` +
			//`| ${fmt('Door', Kiln.door ? 'Closed' : 'Open' )} |\n` +
			`| ${fmt('Heater', Kiln.heater ? 'On' : 'Off' )} |\n` +
			`+----------------------+` );
}

function publish( topic, value ) {

	console.log( "Q>", topic, value /*, typeof value*/ );

	if( value === true ) value = 1;
	else if( value === false ) value = 0;

	_mqtt.send( topic + "/status", value.toString() );
}

function loop() {

	console.clear();
	display();

	// Publish current state of each kiln property
	Object.keys( Kiln ).forEach( key => {
		publish( key, Kiln[key] );
	} );
}

async function startMqtt() {

	var mqtt = await Mqtt( gotMqttData, config, x => x( "+/set" ) );

	console.log( "mqtt", "STARTED" );

	return mqtt;
}

async function main(){

	console.log( "Main", "start all" );

	_mqtt = await startMqtt();

	setInterval( loop, 1000 );

	console.log( "Main", "finish" );
}

main();
