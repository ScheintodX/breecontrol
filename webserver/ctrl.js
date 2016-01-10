"use strict";

var E = require( './E.js' );
var Dot = require( 'dot-object' ),
	Dash = new Dot( '/' );

var log = require( './logging.js' );
var Assert = require( './assert.js' );

var Scripts = require( './scripts.js' );

var Boiler = require( './boiler.js' );


module.exports = function( config, hello, state, brewery ) {

	Assert.present( "config", config );
	Assert.present( "hello", hello );
	Assert.present( "brewery", brewery );
	Assert.present( "state", state );

	var _mqtt, _web;

	function sendStatusMqtt() {
		
		_mqtt( 'infrastructure/brewmaster/presence', "brewmaster" );

		brewery.watch();
		brewery.publish( _mqtt );
	}

	function sendStatusWeb() {

		_web( brewery.asJson() );
	}

	function notifyLoadSaveDone( err, data ) {

		E.rr( err, data );
	}

	var __ctrl = {

		gotWebData: function( data ) {

			log.trace( "WebData", data );

			// crude fix for placing load in the other section...
			/*
			if( data.on == 'runstop' && data.topic == 'load' ) {
				data.on = 'loadsave';
			}
			*/

			switch( data.on ) {

				case "set":

					var val = data.value,
						topic = data.topic
						;

					brewery.setByWeb( topic, val );

					break;

				case "loadsave":

					E.rr( 'loadsave' );

					Assert.present( 'data.device', data.device );

					var boiler = brewery.boilers[ data.device ];

					if( ! boiler ) throw "No boiler found";

					switch( data.topic ) {

						case "load": 

							E.rr( 'load', data.value.load );

							Scripts.load( data.value.load, function( err, Script, script ) {

								if( err ){
									E.rr( err );
									E.rr( err.stack );
								}
								if( err ) return log.error( err );

								var TheScript = Script( script, boiler, config, {

									notify: function( boiler, what, message ){
										log.info( boiler.name, what, message );
									},

									time: config.script.time

								} );

								boiler.script = TheScript.hello;
								boiler._script = TheScript;

								E.rr( 'load done' );
							} );

							break;

						case "save":

							E.rr( "SAVE", data.value.name );

							Scripts.parse( data.value, function( err, data ) {

								if( err ) E.rr( err );
								if( err ) return log.error( err );

								boiler.script = data;
								boiler.script.save();

								E.rr( 'save done' );
							} );

							break;

						case "set":

							E.rr( "SET" );

							Scripts.parse( data.value, function( err, data ) {

								if( err ) E.rr( err );
								if( err ) return log.error( err );

								boiler.script = data;

								E.rr( 'set done' );
							} );

							break;

						default: 
							throw "Unknown action: " + data.topic;

					}
					break;

				case "runstop":

					Assert.present( 'data.device', data.device );

					var boiler = brewery.boilers[ data.device ];

					Assert.present( 'boiler', boiler );

					if( [ 'start', 'pause', 'resume', 'stop', 'next', 'prev' ].indexOf( data.topic ) >= 0 ){

						var script = boiler._script;

						Assert.present( 'script', script );

						script[ data.topic ]();

					} else {
						throw "Unknown action: " + data.topic;
					}
					break;

				default:
					throw "Unknown action: " + data.on;

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

			//var diff = brewery.watch();
			
			if( !( 'scripts' in hello ) ) {

				log.trace( "NOSCRIPT" );

				Scripts.list( function( err, data ) {

					if( err ) E.rr( err );

					if( err ) return log.error( err );

					hello.scripts = data;

					log.trace( "SEND", hello );

					_web( hello );

				} );
			}

			for( var key in brewery.boilers ) {

				var boiler = brewery.boilers[ key ];

				if( boiler._script ){
					boiler._script.run();
				}
			}
		}

	};

	return __ctrl;
};

