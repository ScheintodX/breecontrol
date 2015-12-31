"use strict";

var MQTT = require( './helpers.js' ).mqtt;

var log = require( './logging.js' );
var Assert = require( './assert.js' );

module.exports = function( config, state, boilers ) {

	Assert.present( "config", config );
	Assert.present( "boilers", boilers );
	Assert.present( "state", state );

	var _mqtt, _web;

	var up=true;

	var Ctrl = {

		gotWebData: function( data ) {

			console.log( data );

			switch( data.action ) {

				case "set":

					console.log( "X" );

					var parsed = {};

					console.log( parsed );
					console.log( "xxx" );

				break;
			}
		},

		gotMqttData: function( topic, data ) {
			
			var t = topic.split( '/' );

			MQTT.setByTopic( boilers, topic, parseFloat( data ) );
		},

		onMqttMessage: function( mqtt ) {
			_mqtt = mqtt;
		},
		onWebMessage: function( web ) {
			_web = web;
		}

		/*
		move: function() {

			log.trace( "move" );

			if( up ) {
				boilers.boiler1.script.elapsed += 1;
				boilers.boiler1.script.remaining -= 1;
				boilers.boiler1.script.state.elapsed +=1;
				boilers.boiler1.script.state.remaining -=1;
			}
		}
		*/

	};

	return Ctrl;
};

