#!/usr/bin/nodejs

"use strict";

var DEVICE = "boiler3";

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

var Sensors = {

	lower: AJacket( {
		topic: DEVICE + '/lower',
		temp: {
			topic: DEVICE + '/lower/temp',
			status: { range: [ -20, 500 ], initial: 19 },
			nominal: { range: [ 0, 300 ], initial: 0 },
			timeout: 5000,
			mode: 'simulate'
		},
		heater: {
			topic: DEVICE + '/lower/heater',
			status: { initial: false },
			req: .5,
			mode: 'simulate'
		},
		speed: 10,
		jitter: 2,
		iv: 1000,
		mode: 'simulate'
	} ),

	temp: SInnerTemp( {
		topic: DEVICE + '/temp',
		status: { range: [ -20, 200 ], initial: 14 },
		mode: 'simulate',
		iv: 1000,
		speed: .3,
		jitter: .5
	} ),

	fill: SFloat( {
		topic: DEVICE + '/fill',
		status: { range: [ 0, 1 ], initial: .4 },
		iv: 5000,
		mode: 'random'
	} ),
	lid: SBool( {
		topic: DEVICE + '/lid',
		status: { initial: true },
		freq: .5,
		iv: 300,
		mode: 'simple'
	} ),
	aggitator: ABool( {
		topic: DEVICE + '/aggitator',
		status: { initial: false },
		nominal: { initial: false },
		initial: false,
		timeout: 5000,
		freq: .1,
		iv: 700,
		mode: 'simple'
	} ),
	spare: ABool( {
		topic: DEVICE + '/spare',
		status: { initial: false },
		nominal: { initial: false },
		initial: false,
		timeout: 1000,
		freq: .1,
		iv: 700,
		mode: 'random'
	} )
}

var repl = require( '../repl.js' )( Sensors );

function round( val ) {
	return Math.round( val * 10 ) / 10;
}

function emit( topic, data ) {

	mqttClient.publish( config.mqtt.prefix + topic, data );
}

function run( sensor ) {

	return function() {

		sensor.run( emit, Sensors );
	}
}

function startSensors() {

	for( var key in Sensors ) {

		var sensor = Sensors[ key ];

		E.cho( "Starting " + key + "(" + sensor.conf.iv + ")..." );

		setInterval( run( sensor ), sensor.conf.iv );
	}

	E.cho( "Sensors started" );

}

process.on( 'uncaughtException', function( ex ) {

	console.log( util.inspect( Sensors, {showHidden:false, depth: null} ) );
	console.log( ex.stack );
} );

log.info( "start mqtt test" );

var mqttClient = mqtt.connect( config.mqtt.url, {
	username: config.mqtt.username,
	password: config.mqtt.password
} )
		.on( 'connect', function() {

			mqttClient.subscribe( config.mqtt.prefix + DEVICE + '/+/set' );
			mqttClient.subscribe( config.mqtt.prefix + DEVICE + '/upper/+/set' );
			mqttClient.subscribe( config.mqtt.prefix + DEVICE + '/lower/+/set' );

			E.cho( "MQTT STARTED" );

			startSensors();
} )
		.on( 'message', function( topic, data ) {

			var message = data.toString();

			if( ! topic.startsWith( config.mqtt.prefix ) ) {
				E.rr( "wrong prefix in: " + topic );
			}

			topic = topic.slice( config.mqtt.prefix.length );

			for( var key in Sensors ) {

				var sensor = Sensors[ key ];

				if( sensor.msg && topic.startsWith( sensor.conf.topic ) ) {
					sensor.msg( emit, topic, message );
				}
			}

		} )
		;

repl.addContext( { mqtt: mqttClient, config: config, boiler: Sensors } );

