#!/usr/bin/nodejs

require( './polyfill.js' );
require( 'colors' );
var util = require( 'util' );
var async = require( 'async' );

var E = require( './E.js' );
var log = require( './logging.js' ).file( '/var/log/braumeister.log' );
var Catch = require( './catch.js' ).log( log );

var repl = require( './repl.js' )( {} );

var Websocket = require( './websocket.js' ),
    websocket = false;
var Mqtt = require( './mqtt.js' ),
    mqtt = false;

var Config = require( './config.js' ),
    config = false,
	hello = false;

var Devices = require( './devices.js' ),
    devices = false,
	Brewery = require( './brewery.js' ),
	brewery = false;

var Ctrl = require( './ctrl.js' ),
    ctrl = false;


function initConfig( done ) {

	Config( Catch.ExitOn( "Config", function( err, data ) {

		config = data;
		hello = {
			config: {
				devices: config.devices,
			}
		}
		repl.addContext( { config: config, hello: hello } );

		log.startup( "config", "READY" );

		return done();

	} ) );
}

function initBoilers( done ) {

	Devices.createAll( config.devices, Catch.ExitOn( "Devices", function( err, data ) {
	
		devices = data;

		brewery = Brewery( devices );
		repl.addContext( { brewery: brewery } );
		repl.addContext( {
				brewery: brewery,
				devices: devices,
		} );
		repl.addContext( brewery.devices );

		log.startup( "devices", "READY" );

		return done();
	
	} ) );
}

function startWebsocket( done ) {

	Websocket( ctrl.gotWebData, hello, config.ws, Catch.ExitOn( "Websockets", function( err, data ) {

		websocket = data;

		ctrl.onWebMessage( websocket.send );

		log.startup( "websockets", "STARTED" );

		return done();
	} ) );
}

function startMqtt( done ) {

	Mqtt( ctrl.gotMqttData, config.mqtt, brewery.subscribe,
			Catch.ExitOn( "Mqtt", function( err, data ) {

		mqtt = data;

		ctrl.onMqttMessage( mqtt.send );

		log.startup( "mqtt", "STARTED" );

		return done();
	} ) );
}

function stateReady( err ) {

	if( err ) throw err;

	ctrl = Ctrl( config, hello, brewery );
	repl.addContext( { ctrl: ctrl } );

	async.parallel( [ startWebsocket, startMqtt ], startupDone );
}

function startupDone( err ) {

	if( err ) {
		log.failure( "Startup", err );
		throw err;
	}

	ctrl.start();

	log.startup( "Startup", "DONE" );
}

E.cho( "Startup" );
log.startup( "Startup...", "" );

// === Start Startup ===
async.series( [ initConfig, initBoilers ], stateReady );

