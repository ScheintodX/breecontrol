#!/usr/bin/nodejs

"use strict";

var MESSAGES = require( './MESSAGES.js' );

var MQH = require( '../helpers.js').mqtt;

var mqtt = require( 'mqtt' );

var log = require( '../logging.js' )
		.file( '/var/log/brauerei.test' )
		//.pause( true )
		;

var Ctrl = {
	random: true
};

var repl = require( '../repl.js' )( {
	M: MESSAGES,
	log: log,
	Ctrl: Ctrl
} );

log.info( "start mqtt test" );

var mqttClient = mqtt.connect( 'mqtt://localhost:1883/', {
		username: 'test',
		password: 'test'
} );

repl.addContext( { mqtt: mqttClient } );

function Task( msg ) {

	return function() {

		var val;

		if( 'value' in msg ) {

			val = msg.value;

		} else {

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

			if( Ctrl.random ) {
		
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

			} else {
				val = msg.old;
			}
		}

		log.info( msg.topic, val );
		mqttClient.publish( msg.topic, '' + val );
	}

}

mqttClient.on( 'connect', function() {

	mqttClient.subscribe( 'boiler1/+/set' );
	mqttClient.subscribe( 'boiler1/+/override' );
	mqttClient.subscribe( 'boiler1/jacket/upper/+/set' );
	mqttClient.subscribe( 'boiler1/jacket/lower/+/set' );

	MESSAGES
			.filter( function( msg ){ return msg.iv; } )
			.forEach( function( msg ){

				var iv = msg.iv;
				iv = iv * ( 1 + 0.1 * (Math.random()-0.5) ); // timing jitter

				msg.task = setInterval( Task( msg ), iv );

			} );
		
	console.log( "MQTT STARTED" );
});

mqttClient.on( 'message', function( topic, message ) {

	message = message.toString();

	if( ! /\/set$/.test( topic ) ) return;

	console.log( "!!!!!!!", topic, message );

	var msg = MESSAGES.find( topic.replace( /set$/, 'nominal' ) );
	if( !msg ) msg = MESSAGES.find( topic.replace( /set$/, 'status' ) );

	console.log( msg.topic );

	msg.value = message;

	if( typeof( msg.task ) == 'function' ) msg.task();

});
