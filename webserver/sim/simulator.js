#!/usr/bin/nodejs

"use strict";

var util = require( 'util' );

var E = require( '../E.js' );
require( '../polyfill.js' );
require( './patch.js' );

var config = require( '../config.js' )( function( err, data ){ return data; } );

var SFloat = require( './s_float.js' ),
	SBool = require( './s_bool.js' ),
	ABool = require( './a_bool.js' ),
	AJacket = require( './a_jacket.js' ),
	SInnerTemp = require( './s_inner_temp.js' )
	;

var mqtt = require( 'mqtt' );

var log = require( '../logging.js' )
		.file( '/var/log/braumeister.test' );

var Devices = {
		boiler1: require( './sim_boiler.js' )( 'boiler1' ),
		boiler2: require( './sim_boiler.js' )( 'boiler2' ),
		gloggmaker1: require( './sim_gloggmaker.js' )( 'gloggmaker1' ),
		chiller1: require( './sim_chiller.js' )( 'chiller1' ),
	}
	;

var repl = require( '../repl.js' )( Devices );

function emit( topic, data ) {

	mqttClient.publish( config.mqtt.prefix + topic, data );
}

function run( sensor, device ) {

	return function() {

		sensor.run( emit, device );
	}
}

function startDevices() {

	for( var dev in Devices ) {

		var device = Devices[ dev ];

		for( var key in device ) {

			if( key == '_conf' ) continue;

			var sensor = device[ key ];

			E.cho( "Starting " + device._conf.device + "/" + key + "(" + sensor.conf.iv + ")..." );

			setInterval( run( sensor, device ), sensor.conf.iv );
		}
	}
	E.cho( "Devices started" );
}

process.on( 'uncaughtException', function( ex ) {

	console.log( util.inspect( Devices, {showHidden:false, depth: null} ) );
	console.log( ex.stack );
} );

log.info( "start mqtt test" );

function onConnect() {

	for( var dev in Devices ) {

		var device = Devices[ dev ],
			subs = device._conf.subscriptions
			;

		for( var i=0; i<subs.length; i++ ) {

			mqttClient.subscribe( config.mqtt.prefix + subs[ i ] );
		}
	}

	E.cho( "MQTT STARTED" );

	startDevices();
}

function onMessage( topic, data ) {

	var message = data.toString();

	if( ! topic.startsWith( config.mqtt.prefix ) ) {
		E.rr( "wrong prefix in: " + topic );
	}

	// remove Griessbraeu
	topic = topic.slice( config.mqtt.prefix.length );

	for( var dev in Devices ) {

		var device = Devices[ dev ];

		for( var key in device ) {

			if( key.startsWith( '_' ) ) continue;

			var sensor = device[ key ];

			if( sensor.msg && topic.startsWith( sensor.conf.topic ) ) {
				sensor.msg( emit, topic, message );
			}
		}
	}
}

var mqttClient = mqtt.connect( config.mqtt.url, {
	username: config.mqtt.username,
	password: config.mqtt.password
} )
		.on( 'connect', onConnect )
		.on( 'message', onMessage )
		;

repl.addContext( { mqtt: mqttClient, config: config } );
