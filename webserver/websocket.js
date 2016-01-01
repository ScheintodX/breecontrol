"use strict";

var ws = require( 'nodejs-websocket' );

var log = require( './logging.js' );

var Assert = require( './assert.js' );

var _onData = false;

var _data = false,
	_config = false
	;

var _wsServer = false,
	_sender = false
	;

function gotText( conn, str ) {

	log.trace( 'Received ', str );

	try {
		var data = JSON.parse( str );
		if( _onData ) _onData( data );
	} catch( ex ) {
		log.warn( 'Cannot decode', str );
	}
}

function gotClose( conn, code, reason ) {

	log.trace( 'Connection closed', code, reason );
}

function gotError( conn, err ) {

	log.warn( err );
}

function gotConnection( conn ) {
	
	log.trace( "New connection %s", conn.key );

	conn.on( 'text', function( str ) { gotText( conn, str ); } );
	conn.on( 'close', function( code, reason ){ gotClose( conn, code, reason ); } );
	conn.on( 'error', function( err ){ gotClose( conn, err ); } );

	conn.sendText( JSON.stringify( {

		boilers: _data.boilers,
		config: _config.config

	} ) );

}

function sendToAll( data ) {

	var text = JSON.stringify( data );

	_wsServer.connections.forEach( function( conn ){

		log.trace( "send" );
		conn.sendText( text );
	} );

}

module.exports = function( onData, config, data, done ) {

	Assert.present( 'onData', onData );
	Assert.present( 'config', config );
	Assert.present( 'data', data );
	Assert.present( 'done', done );

	log.trace( "Websocket starting" );

	_onData = onData;

	_config = config;
	_data = data;

	_wsServer = ws.createServer( gotConnection );
	try {
		_wsServer.listen( config.port, function() {
				log.trace( 'Websocket LISTENING' );
				return done( null, __websocket );
		} );
	} catch( ex ) {
		log.failure( "WS", ex );
		return done( ex );
	}

	var __websocket = {

		send: sendToAll
	}
}
