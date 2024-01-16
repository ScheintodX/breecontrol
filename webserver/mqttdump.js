#!/usr/bin/node

import 'colors';

//import E from './E.js';
import log from '#logging';

import Catch from '#catch'
Catch.log( log );
import Assert from '#assert';

import Mqtt from '#mqtt';
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

function now() {
	return (Date.now() - start) / 1000;
}

const start = Date.now();
function gotMqttData( t, v ){

	var entry = Store[ t ];
	if( !entry ){
		entry = Entry();
		Store[ t ] = entry;
	}
	if( entry.val != v ){
		entry.time = now().toFixed(1);
	}
	entry.val = v;
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
		for( var [k,e] of Object.entries( Store ) ){
			if( now() - e.time < 5 ){
				console.log( k, ("" + e.val).green );
			} else if( now() - e.time < 15 ){
				console.log( k, ("" + e.val).yellow );
			} else {
				console.log( k, ("" + e.val).blue );
			}
		}
	}, 1000 );

	log.startup( "Main", "finish" );
	log.pause = true;
}

main();

