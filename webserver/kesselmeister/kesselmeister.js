#!/usr/bin/nodejs

"use strict";

if( process.argv.length != 3 )
		throw "Usage: nodeblah kesselmeister NAME"

var BASE = process.argv[ 2 ];

var config = require( './config.js' );

var E = require( '../E.js' );
require( './polyfill.js' );

var mqtt = require( 'mqtt' );

var log = require( '../logging.js' )
		.file( '/var/log/brauerei.test' );

var Boiler = require( './boiler.js' )( BASE );

var repl = require( '../repl.js' )( {
	Boiler: Boiler
} );

function emit( topic, data ) {

	mqttClient.publish( topic, data );
}

function run( sensor ) {

	return function() {

		sensor.run( emit, Sensors );
	}
}

log.info( "start mqtt test" );

var mqttClient = mqtt.connect( config.mqtt.url ), {
	username: config.mqtt.username,
	password: config.mqtt.password
} )
		.on( 'connect', function() {

			mqttClient.subscribe( BASE + '/#' );

			setInterval( publish, conf.updateInterval );

			E.cho( "MQTT STARTED" );

			startSensors();
} )
		.on( 'message', function( topic, data ) {

			var message = data.toString();

			for( var key in Sensors ) {

				var sensor = Sensors[ key ];

				if( sensor.msg && topic.startsWith( sensor.conf.topic ) ) {
					sensor.msg( emit, topic, message );
				}
			}

		} )
		;

repl.addContext( { mqtt: mqttClient } );

