#!/usr/bin/nodejs

"use strict";

var util = require( 'util' );

var E = require( '../E.js' );
require( '../polyfill.js' );
require( './patch.js' );

var SFloat = require( './s_float.js' ),
	SBool = require( './s_bool.js' ),
	ABool = require( './a_bool.js' ),
	AJacket = require( './a_jacket.js' ),
	SInnerTemp = require( './s_inner_temp.js' )
	;

var mqtt = require( 'mqtt' );

var log = require( '../logging.js' )
		.file( '/var/log/brauerei.test' );

var Sensors = {

	upper: AJacket( {
		topic: 'boiler1/upper',
		temp: {
			topic: 'boiler1/upper/temp',
			status: { range: [ -20, 600 ], initial: 20 },
			nominal: { range: [ 0, 400 ], initial: 0 },
			timeout: 5000,
			mode: 'simulate'
		},
		heater: {
			topic: 'boiler1/upper/heater',
			status: { initial: false },
			freq: .5,
			mode: 'simulate'
		},
		speed: 5,
		jitter: 3,
		iv: 1000,
		mode: 'simulate'
	} ),

	lower: AJacket( {
		topic: 'boiler1/lower',
		temp: {
			topic: 'boiler1/lower/temp',
			status: { range: [ -20, 500 ], initial: 19 },
			nominal: { range: [ 0, 300 ], initial: 0 },
			timeout: 5000,
			mode: 'simulate'
		},
		heater: {
			topic: 'boiler1/lower/heater',
			status: { initial: false },
			req: .5,
			mode: 'simulate'
		},
		speed: 5,
		jitter: 2,
		iv: 1000,
		mode: 'simulate'
	} ),

	temp: SInnerTemp( {
		topic: 'boiler1/temp',
		status: { range: [ -20, 200 ], initial: 14 },
		mode: 'simulate',
		iv: 1000,
		speed: 10,
		jitter: .5
	} ),

	fill: SFloat( {
		topic: 'boiler1/fill',
		status: { range: [ 0, 1 ], initial: .4 },
		iv: 5000,
		mode: 'random'
	} ),
	lid: SBool( {
		topic: 'boiler1/lid',
		status: { initial: true },
		freq: .5,
		iv: 300,
		mode: 'simple'
	} ),
	aggitator: ABool( {
		topic: 'boiler1/aggitator',
		status: { initial: false },
		nominal: { initial: false },
		initial: false,
		timeout: 5000,
		freq: .1,
		iv: 700,
		mode: 'simple'
	} )
}

var repl = require( '../repl.js' )( Sensors );

function round( val ) {
	return Math.round( val * 10 ) / 10;
}


function emit( topic, data ) {

	mqttClient.publish( topic, data );
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

var mqttClient = mqtt.connect( 'mqtt://localhost:1883/', {
	username: 'test',
	password: 'test'
} )
		.on( 'connect', function() {

			mqttClient.subscribe( 'boiler1/+/set' );
			mqttClient.subscribe( 'boiler1/upper/+/set' );
			mqttClient.subscribe( 'boiler1/lower/+/set' );

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

