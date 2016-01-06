"use strict";

var E = require( './E.js' );

var Assert = require( './assert.js' );
var log = require( './logging.js' );

var mqtt = require( 'mqtt' );

var Dot = require( 'dot-object' );


// Scream server example: "hi" -> "HI!!!" 

module.exports = function( onData, config, done ) {

	Assert.present( 'onData', onData );
	Assert.present( 'config', config );
	Assert.present( 'done', done );

	log.trace( "MQTT starting" );

	var _onData = false;

	_onData = onData;

	var mqttClient = mqtt.connect( config.url, {
			username: config.username,
			password: config.password
	} );

	mqttClient.on( 'connect', function () {
		log.trace( "MQTT Connect" );
		mqttClient.subscribe( 'infrastructure/#' );
		mqttClient.subscribe( 'boiler1/#' );
		log.trace( "MQTT STARTED" );
		return done( null, __mqtt );
	});

	mqttClient.on( 'message', function( topic, message ) {

		log.trace( 'MQTT <recv', topic, message.toString() );

		_onData( topic, message.toString() );
	});

	mqttClient.on( 'error', function( err ){

		throw( err );
	});

	var __mqtt = {

		send: function( topic, data ) {

			log.trace( "MQTT send>", topic, data );

			mqttClient.publish( topic, data );
		},

		sendSet: function( obj ) {

			var dot = new Dot( '/' ),
				dotted = dot.dot( obj );

			for( var key in dotted ) {

				send( key, dottet[ key ] );
			}

		}

	};
};
