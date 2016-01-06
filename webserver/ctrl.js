"use strict";

var E = require( './E.js' );
var Dot = require( 'dot-object' ),
	Dash = new Dot( '/' );

var log = require( './logging.js' );
var Assert = require( './assert.js' );

var Script = require( './script.js' );

var Boiler = require( './boiler.js' );

module.exports = function( config, state, brewery ) {

	Assert.present( "config", config );
	Assert.present( "brewery", brewery );
	Assert.present( "state", state );

	var _mqtt, _web;

	var up=true;

	function sendStatusMqtt() {
		
		_mqtt( 'infrastructure/brewmaster/presence', "brewmaster" );

		brewery.watch();
		brewery.publish( _mqtt );
	}

	function sendStatusWeb() {

		_web( { boilers: brewery.boilers } );
	}

	function notifyLoadSaveDone( err, data ) {

		E.rr( err, data );
	}

	var __ctrl = {

		gotWebData: function( data ) {

			log.trace( "WebData", data );

			switch( data.on ) {

				case "set":

					E.rr( "WEB", data );

					var val = data.value,
						topic = data.topic
						;

					brewery.setByWeb( topic, val );

					break;

				case "loadsave":

					var boiler = brewery.boilers[ 'boiler' + data.value.no ];

					switch( data.topic ) {

						case "load": 

							boiler.script = Script( data.value.load, notifyLoadSaveDone );

							break;

						case "save":

							E.rr( "SAVE", data.value.name );

							boiler.script = Script( data.value, notifyLoadSaveDone );

							boiler.script.save();

							break;

						case "set":

							E.rr( "SET" );

							boiler.script = Script( data.value, notifyLoadSaveDone );

							break;

						default: 
							throw "Unknown action: " + data.topic;

					}
					break;

				default:
					throw "Unknown action: " + data.action;

			}

		},

		gotMqttData: function( topic, data ) {

			brewery.setByMqtt( topic, data );
		},

		onMqttMessage: function( mqtt ) {

			_mqtt = mqtt;

			Assert.present( "config.updateIntervalMqtt", config.updateIntervalMqtt );

			setInterval( sendStatusMqtt, config.updateIntervalMqtt );
		},

		onWebMessage: function( web ) {

			_web = web;

			Assert.present( "config.updateIntervalWeb", config.updateIntervalWeb );

			setInterval( sendStatusWeb, config.updateIntervalWeb );
		},

		run: function() {

			var diff = brewery.watch();
		}

	};

	return __ctrl;
};

