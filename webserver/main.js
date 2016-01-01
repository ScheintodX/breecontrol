#!/usr/bin/nodejs

var log = require( './logging.js' ).file( '/var/log/brauerei.log' );

require( './repl.js' )( {
	config: function(){ return config; },
	boilers: function(){ return boilers; },
	brewery: function(){ return brewery; },
	state: function(){ return state; }
} );

var async = require( 'async' );

var Websocket = require( './websocket.js' ),
    websocket = false;
var Mqtt = require( './mqtt.js' ),
    mqtt = false;

var Config = require( './config.js' ),
    config = false;

var Boilers = require( './boiler.js' ),
    boilers = false,
	brewery = false;

var State = require( './state.js' ),
    state = false;

var script = require( './script.js' );

var Ctrl = require( './ctrl.js' ),
    ctrl = false;

function initConfig( done ) {

	Config( function( err, data ) {

		if( err ) {
			log.failure( "config", err );
			return done( err );
		}

		config = data;

		log.startup( "config", "READY" );

		return done();

	} );
}

function initState( done ) {

	State( config.state, function( err, data ) {

		log.trace( "state", err, data );

		if( err ){
			log.failure( "state", err );
			throw err;
		}

		state = data;

		setInterval( function() {

			State.save( stateSaved );

		}, 5000 );

		log.startup( "state", "READY" );

		return done();
	} );
}

function stateSaved( err ) {

	if( err ) throw err;

	log.trace( "STATE saved" );
}

function initBoilers( done ) {

	// Create something to store state in
	if( !( 'boilers' in state ) ) {
		log.trace( "create boiler state" );
		state.boilers = {};
	}

	Boilers.createAll( config.boilers, state.boilers, function( err, data ) {
	
		if( err ) {
			log.failure( "boilers" );
			return done( err );
		}

		boilers = data;

		brewery = {
			boilers: boilers,
			clone: function() {
				return JSON.parse( JSON.stringify( this ) );
			}
		};

		log.startup( "boilers", "READY" );

		return done();
	
	} );
}

function startWebsocket( done ) {

	Websocket( ctrl.gotWebData, config.ws, brewery, function( err, data ) {

		if( err ){
			log.failure( "websockets" );
			return done( err );
		}

		websocket = data;

		ctrl.onWebMessage( websocket.send );

		log.startup( "websockets", "STARTED" );

		return done();
	} );
}

function startMqtt( done ) {

	Mqtt( ctrl.gotMqttData, config.mqtt, function( err, data ) {

		if( err ) {
			log.failure( "mqtt", err );
			return done( err );
		}

		mqtt = data;

		ctrl.onMqttMessage( mqtt.send );

		log.startup( "mqtt", "STARTED" );

		return done();
	} );
}

function stateReady( err ) {

	if( err ) throw err;

	ctrl = Ctrl( config, state, brewery );

	async.parallel( [ startWebsocket, startMqtt ], startupDone );
}

function startupDone( err ) {

	if( err ) {
		log.failure( "Startup", err );
		throw err;
	}

	log.startup( "Startup", "DONE" );
}

log.startup( "Startup...", "" );

// Make cleaner exit handling:
process.stdin.resume();

function gotExit( opt, err ) {

	if (opt.cleanup) console.log('clean');
	if (err) console.log(err.stack);
	if (opt.exit) process.exit();
}

//do something when app is closing
process.on( 'exit', gotExit.bind( null,{ cleanup: true } ) );

//catches ctrl+c event
process.on( 'SIGINT', gotExit.bind( null, { exit: true } ) );

//catches uncaught exceptions
process.on( 'uncaughtException', gotExit.bind( null, { exit: true } ) );

// === Start Startup ===
async.series( [ initConfig, initState, initBoilers ], stateReady );

