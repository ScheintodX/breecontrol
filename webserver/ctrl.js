"use strict";

var MQTT = require( './helpers.js' ).mqtt;

var log = require( './logging.js' );
var Assert = require( './assert.js' );

module.exports = function( config, state, brewery ) {

	Assert.present( "config", config );
	Assert.present( "brewery", brewery );
	Assert.present( "state", state );

	var _mqtt, _web;

	var up=true;

	function sendPeriodically() {

		var patched = brewery.clone();

		var boilers = [ patched.boilers.boiler1, patched.boilers.boiler2 ];

		for( var i=0; i<boilers.length; i++ ) {

			var boiler = boilers[ i ];

			/*
			if( i == 0 ) {
				console.log( "SEND", boiler.fill );
			}
			*/

			if( 'override' in boiler.fill ) {
				boiler.fill.status = boiler.fill.override;
			}

			if( 'override' in boiler.lid ) {
				boiler.lid.status = boiler.lid.override;
			}

			/*
			if( i == 0 ) {
				console.log( "stat", boiler.fill );
			}
			*/

		}

		delete patched.lastSend;
		brewery.lastSend = patched;

		_web( patched );
	}

	var __ctrl = {

		gotWebData: function( data ) {

			log.trace( "WebData", data );

			switch( data.action ) {

				case "set":

					console.log( "WEB", data );

					var val = data.value;
					if( typeof val == 'boolean' ) val = val ? 1 : 0;

					var topic = data.topic.replace( /\./g, '/' );

					console.log( "-AS", topic, val );

					if( val == null ) {
						_mqtt( topic, null );
					} else {
						_mqtt( topic, ''+val );
					}

				break;
			}
		},

		gotMqttData: function( topic, data ) {
			
			var t = topic.split( '/' );

			var parsed, parsedAs;
			
			if( data === null || typeof data == 'undefined' ){
				parsed = null;
				parsedAs = "nUlL";
			} else{
				parsed = parseFloat( data );
				parsedAs = "float";
			}

			if( topic.match( /.*\/(fill|lid)\/.*/ ) ){
				console.log( "GOT", topic, data, parsed, typeof data, parsedAs );
			}

			MQTT.setByTopic( brewery.boilers, topic, parsed );

			/*
			if( t[ t.length-1 ] == 'override' ) {
				console.log( brewery.boilers.boiler1.lid );
			}
			*/
		},

		onMqttMessage: function( mqtt ) {

			_mqtt = mqtt;
		},

		onWebMessage: function( web ) {

			_web = web;

			Assert.present( "config.updateInterval", config.updateInterval );

			setInterval( sendPeriodically, config.updateInterval );
		}

	};

	return __ctrl;
};

