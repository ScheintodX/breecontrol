#!/usr/bin/nodejs

"use strict";

var MESSAGES = require( './MESSAGES.js' );

var mqtt = require( 'mqtt' );

var mqttClient = mqtt.connect( 'mqtt://localhost:1883/', {
		username: 'test',
		password: 'test'
} );

function Task( msg ) {

	return function() {

		var val;
		
		if( !( 'old' in msg ) ) {
			switch( msg.type ) {
				case "b": 
					msg.old = 1;
					break;
				case "f":
					var r = msg.range;
					msg.old = (r[1]-r[0])/2;
			}
		}

		switch( msg.type ) {
			case "b":
				val = msg.old;
				if( Math.random() < 0.1 ) val = ( val == 0 ? 1 : 0 );
				break;
			case "f":
				var r = msg.range,
					rnd = Math.random() * ( r[1]-r[0]) + r[0];
				val = ( msg.old + 4*rnd ) / 5;
				val = Math.round( val*10 ) / 10;
		}

		msg.old = val;

		console.log( msg.topic, val );
		mqttClient.publish( msg.topic, '' + val );
	}

}

mqttClient.on( 'connect', function() {

	console.log( "MQTT Connect" );

	//mqttClient.subscribe( 'presence' );
	//mqttClient.publish( 'presence', 'sensor' );

	/*
	setInterval( function() {
		temp += .1;
		mqttClient.publish( 'boiler1/temp/is', ''+ temp );
	}, 100 );
	*/

	for( var i=0; i<MESSAGES.length; i++ ) {

		var msg = MESSAGES[ i ];

		if( msg.iv ) {

			var iv = msg.iv;
			iv = iv * ( 1 + 0.1 * (Math.random()-0.5) ); // timing jitter

			setInterval( Task( msg ), iv );
		}

	}

	console.log( "MQTT STARTED" );
});

mqttClient.on( 'message', function( topic, message ) {

	console.log( topic, message );
});
