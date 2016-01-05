#!/usr/bin/nodejs

"use strict";

var E = require( '../E.js' );
require( './polyfill.js' );

var SFloat = require( './s_float.js' ),
	SBool = require( './s_bool.js' ),
	ABool = require( './a_bool.js' ),
	STemp = require( './s_temp.js' ),
	SJacket = require( './s_jacket.js' )
	;

var mqtt = require( 'mqtt' );

var log = require( '../logging.js' )
		.file( '/var/log/brauerei.test' );

var Sensors = {

	temp: STemp( {
		topic: 'boiler1/temp',
		status: { range: [ -20, 200 ] },
		nominal: { range: [ 0, 100 ] },
		random: true,
		iv: 1000,
		speed: 1
	} ),

	upper: SJacket( {
		topic: 'boiler1/jacket/upper',
		temp: {
			topic: 'boiler1/jacket/upper/temp',
			status: { range: [ -20, 200 ] },
			nominal: { range: [ 0, 100 ] },
			random: true
		},
		power: {
			topic: 'boiler1/jacket/upper/power',
			range: [ 0, 1 ],
			random: true
		},
		heater: {
			topic: 'boiler1/jacket/upper/heater',
			freq: .5,
			random: true
		},
		iv: 1000,
		random: true
	} ),

	lower: SJacket( {
		topic: 'boiler1/jacket/lower',
		temp: {
			topic: 'boiler1/jacket/lower/temp',
			status: { range: [ -20, 200 ] },
			nominal: { range: [ 0, 100 ] },
			random: true
		},
		power: {
			topic: 'boiler1/jacket/lower/power',
			range: [ 0, 1 ],
			random: true
		},
		heater: {
			topic: 'boiler1/jacket/lower/heater',
			freq: .5,
			random: true
		},
		iv: 1000,
		random: true
	} ),

	fill: SFloat( {
		topic: 'boiler1/fill',
		range: [ 0, 1 ],
		iv: 5000,
		random: true
	} ),
	lid: SBool( {
		topic: 'boiler1/lid',
		freq: .5,
		iv: 300,
		random: true
	} ),
	aggitator: ABool( {
		topic: 'boiler1/aggitator',
		freq: .1,
		iv: 700,
		random: true
	} )
}

var repl = require( '../repl.js' )( {
	Sensor: Sensors
} );

function round( val ) {
	return Math.round( val * 10 ) / 10;
}


function emit( topic, data ) {

	mqttClient.publish( topic, data );
}

function run( sensor ) {

	return function() {

		sensor.run( emit );
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

log.info( "start mqtt test" );

var mqttClient = mqtt.connect( 'mqtt://localhost:1883/', {
	username: 'test',
	password: 'test'
} )
		.on( 'connect', function() {

			mqttClient.subscribe( 'boiler1/+/set' );
			mqttClient.subscribe( 'boiler1/+/override' );
			mqttClient.subscribe( 'boiler1/jacket/upper/+/set' );
			mqttClient.subscribe( 'boiler1/jacket/lower/+/set' );

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

