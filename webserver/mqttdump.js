#!/usr/bin/node

import 'colors';

//import { E } from './E.js';
import { log } from './logging.js';

import { Catch } from './catch.js'
Catch.log( log );
import { Assert } from './assert.js';

import Mqtt from './mqtt.js';
var _mqtt = false;

const config = {
    //url: "mqtt://mqtt.flo.axon-e.de:1883",
    url: "mqtt://localhost:1883",
    username: "lakai",
    password: "lakai",
    prefix: "braumeister/"
}

var Store = {};
var Entry = function(){
	return {
		val: 0
	};
}

const start = Date.now();
function gotMqttData( t, v ){

	var entry = Store[ t ];
	if( !entry ){
		entry = Entry();
		Store[ t ] = entry;
	}
	entry.val = v;
	entry.time = ((Date.now() - start) / 1000).toFixed(1);
}

async function startMqtt() {

    var mqtt = await Mqtt( gotMqttData, config, x => x( "#" ) );

	Assert.present( 'mqtt', mqtt );

	log.startup( "mqtt", "STARTED" );

	return mqtt;
}

async function main(){

	log.startup( "Main", "start all" );

	_mqtt = await startMqtt();

	setInterval( ()=> {
		console.log("\x1b[2J");
		console.log( Store );
	}, 1000 );

	log.startup( "Main", "finish" );
}

main();

