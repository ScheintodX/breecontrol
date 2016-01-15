#!/usr/bin/nodejs

require( './polyfill.js' );
require( 'colors' );
var util = require( 'util' );
var async = require( 'async' );

var E = require( './E.js' );
var log = require( './logging.js' ).file( '/var/log/brauerei.log' );
var Catch = require( './catch.js' ).log( log );

var repl = require( './repl.js' )( {} );

var Websocket = require( './websocket.js' ),
    websocket = false;
var Mqtt = require( './mqtt.js' ),
    mqtt = false;

var Config = require( './config.js' ),
    config = false,
	hello = false;

var Boilers = require( './boiler.js' ),
    boilers = false,
	Brewery = require( './brewery.js' ),
	brewery = false;

var State = require( './state.js' ),
    state = false;

var Ctrl = require( './ctrl.js' ),
    ctrl = false;


function initConfig( done ) {

	Config( Catch.ExitOn( "Config", function( err, data ) {

		config = data;
		hello = {
			config: {
				boilers: config.boilers,
			}
		}
		repl.addContext( { config: config, hello: hello } );

		log.startup( "config", "READY" );

		return done();

	} ) );
}

function initState( done ) {

	State( config.state, Catch.ExitOn( "State", function( err, data ) {

		state = data;
		repl.addContext( { state: state } );

		State.start( config.saveStateInterval );

		log.startup( "state", "READY" );

		return done();
	} ) );
}

function initBoilers( done ) {

	// Create something to store state in
	if( !( 'boilers' in state ) ) {
		log.trace( "create boiler state" );
		state.boilers = {};
	}

	Boilers.createAll( config.boilers, state.boilers, Catch.ExitOn( "Boilers", function( err, data ) {
	
		boilers = data;

		brewery = Brewery( boilers );
		repl.addContext( { brewery: brewery } );
		repl.addContext( {
				brewery: brewery,
				boilers: boilers,
				boiler1: boilers.boiler1,
				boiler2: boilers.boiler2
		} );

		log.startup( "boilers", "READY" );

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

	ctrl = Ctrl( config, hello, state, brewery );
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
async.series( [ initConfig, initState, initBoilers ], stateReady );

