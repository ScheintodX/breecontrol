"use strict";

var E = require( './E.js' );
var Catch = require( './catch.js' );
var Dot = require( 'dot-object' ),
	Dash = new Dot( '/' );

var log = require( './logging.js' );
var Assert = require( './assert.js' );

var Scripts = require( './scripts.js' );

var Boiler = require( './boiler.js' );


module.exports = function( config, hello, brewery ) {

	Assert.present( "config", config );
	Assert.present( "hello", hello );
	Assert.present( "brewery", brewery );

	var _mqtt, _web;

	function _msg( boiler, level, text ) {

		return _web( {
			message: {
				device: boiler, 
				level: level,
				messages: [
					{ level: level, text: text }
				]
			}
		} );
	}

	function _warn( boiler, text ) {
		return _msg( boiler, 'warn', text );
	}
	function _info( boiler, text ) {
		return _msg( 'info', text );
	}

	function sendStatusMqtt() {
		
		_mqtt( 'infrastructure/brewmaster/presence', "brewmaster" );

		brewery.watch();

		brewery.publish( _mqtt );
	}

	function sendStatusWeb() {

		_web( brewery.asJson() );
	}

	function gotWebDataSet( data ) {

		var val = data.value,
			topic = data.topic
			;

		var diff = brewery.setByWeb( topic, val );

		log.trace( JSON.stringify( diff ) );

		if( diff ) brewery.publish( _mqtt );
	}

	function gotWebDataLoadSave( data ) {

		Assert.present( 'data.device', data.device );
		Assert.present( 'data.topic', data.topic );

		var boiler = brewery.boilers[ data.device ];

		if( ! boiler ) throw new Error( "No boiler found" );

		switch( data.topic ) {

			case "load": 

				log.trace( 'load', data.value.load );

				Scripts.load( data.value.load, function( err, Script, script ) {

					if( err ) return log.error( err );

					var TheScript = Script( script, boiler, config, {

						notify: function( boiler, what, message ){
							log.info( boiler.name, what, message );
						},

						time: config.script.time

					} );

					boiler.script = TheScript.hello;
					boiler._script = TheScript;

					sendStatusWeb();

					log.info( 'load done', data.value.load );
				} );

				break;

			case "save":

				log.trace( "SAVE", data.value.name );

				if( !boiler.script ) {
					_warn( data.device, 'No script available' );
					return;
				}

				boiler._script.parse( data.value, function( err, TheScript ) {

					if( err ) return _warn( data.device, err );
					else _info( data.device, 'Set done' );

					boiler.script = TheScript.hello;
					boiler._script = TheScript;

					var saveable = boiler._script.save();

					Scripts.save( data.value.name, saveable, function( err ) {

						_info( "Saved" );
						log.trace( "SAVED", data.value.name );

						delete( hello.scripts ); // force reload

					} );

				} );

				break;

			case "set":

				log.trace( "SET" );

				if( !boiler.script ) {
					_warn( data.device, 'No script available' );
					return;
				}

				boiler._script.parse( data.value, function( err, TheScript ) {

					if( err ) return _warn( data.device, err );
					else _info( data.device, 'Set done' );

					boiler.script = TheScript.hello;
					boiler._script = TheScript;

					log.info( "SET done", boiler.script );
				} );

				break;

			default: 
				throw new Error( "Unknown action: " + data.topic );

		}

	}

	function gotWebDataRunStop( data ) {

		Assert.present( 'data.device', data.device );

		var boiler = brewery.boilers[ data.device ];

		Assert.present( 'boiler', boiler );

		if( [ 'start', 'pause', 'resume', 'stop', 'next', 'prev' ].indexOf( data.topic ) >= 0 ){

			var script = boiler._script;

			Assert.present( 'script', script );

			script[ data.topic ]();

		} else {
			throw new Error( "Unknown action: " + data.topic );
		}
	}

	var self = {

		gotWebData: Catch.fatal( "Ctrl/gotWeb", function( data ) {

			log.trace( "WebData", data );

			switch( data.on ) {
				case "set": return gotWebDataSet( data ); break;
				case "loadsave": gotWebDataLoadSave( data ); break;
				case "runstop": gotWebDataRunStop( data ); break;
				default: throw new Error( "Unknown action: " + data.on );
			}

		} ),

		gotMqttData: Catch.fatal( "Ctrl/GotMqtt", function( topic, data ) {

			var diff = brewery.setByMqtt( topic, data );

			if( diff ) {
				_web( { diff: diff } );
			}
		} ),

		onMqttMessage: function( mqtt ) {

			_mqtt = Catch.fatal( "Ctrl/Mqtt", mqtt );

			Assert.present( "config.updateIntervalMqtt", config.updateIntervalMqtt );

			setInterval( Catch.fatal( "Ctrl/SendStatusMqtt", sendStatusMqtt ), config.updateIntervalMqtt );
		},

		onWebMessage: function( web ) {

			_web = Catch.fatal( "Ctrl/WS", web );

			Assert.present( "config.updateIntervalWeb", config.updateIntervalWeb );

			setInterval( Catch.fatal( "Ctrl/SendStatusWeb", sendStatusWeb ), config.updateIntervalWeb );
		},

		run: function() {

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
		},

		start: function() {

			setInterval( Catch.fatal( "Ctrl/Run", self.run ), config.updateIntervalCtrl );
		}
	};

	return self;
};

