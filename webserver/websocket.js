"use strict";

var ws = require( 'nodejs-websocket' );

var log = require( './logging.js' );
var E = require( './E.js' );

var Assert = require( './assert.js' );

var _onData = false;

var _wsServer = false,
	_sender = false
	;

var _hello = false;

function gotText( conn, str ) {

	log.trace( 'Received ', str );

	try {
		var data = JSON.parse( str );
	} catch( ex ) {
		return log.ex( ex, 'Cannot decode: ', str );
	}

	try {
		if( _onData ) _onData( data );
	} catch( ex ) {
		return log.ex( ex, 'Processing Event: ', data );
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

	setTimeout( function() {

		conn.sendText( JSON.stringify( _hello ) );

	}, 0 );

}

function sendToAll( data ) {

	var text;
	switch( typeof data ) {
		case 'string':
			text = data;
			break;
		case 'object':
			text = JSON.stringify( data );
			break;
		default:
			throw new Error( "Cannot send " + data + " because it's a " + (typeof data) );
			break;
	}

	_wsServer.connections.forEach( function( conn ){

		log.trace( "send" );
		conn.sendText( text );
	} );

}

module.exports = function( onData, hello, config, done ) {

	Assert.present( 'onData', onData );
	Assert.present( 'config', config );
	Assert.present( 'done', done );

	log.trace( "Websocket starting" );

	_hello = hello;
	_onData = onData;

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
