"use strict";

var log = require( './logging.js' );
var E = require( './E.js' );

var Assert = require( './assert.js' );

var server = require( 'http' ).createServer(),
    url = require('url'),
	WebSocketServer = require( 'ws' ).Server,
	wss,
	express = require( 'express' ),
	app,
	PORT = 8999
	;

var _onData = false;
var _hello = false;

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

	//log.trace( "send (" + wss.connections.length + ")", text );

	wss.clients.forEach( function( client ) {

		client.send( text );

	} );
}

function gotClose( conn, code, reason ) {

	E.rr( 'Connection closed', code, reason );
	log.trace( 'Connection closed', code, reason );
}

function gotError( conn, err ) {

	E.rr( 'ERR ', err );
	log.warn( err );
}

function gotMessage( message ) {

	E.rr( 'Received ', message );
	log.trace( 'Received ', message );

	try {
		var data = JSON.parse( message );
	} catch( ex ) {
		return log.ex( ex, 'Cannot decode: ', message );
	}

	try {
		if( _onData ) _onData( data );
	} catch( ex ) {
		return log.ex( ex, 'Processing Event: ', data );
	}
}

function gotConnection( conn ) {

	E.rr( "CON" );

	//var location = url.parse( conn.upgradeReq.url, true );

	conn.on( 'message', gotMessage );
	conn.on( 'error', gotError );
	conn.on( 'close', gotClose );

	setTimeout( function() {

		conn.send( JSON.stringify( _hello ) );

	}, 0 );
}

module.exports = function( onData, hello, config, done ) {

	Assert.present( 'onData', onData );
	Assert.present( 'config', config );
	Assert.present( 'done', done );

	log.trace( "Express starting" );

	_hello = hello;
	_onData = onData;

	app = express();
	app.use( express.static( '../webclient' ) );

	wss = new WebSocketServer( { server: server } );
	wss.on( 'connection', gotConnection );

	server.on( 'request', app );

	server.listen( PORT, function(){ 
	
		return done( null, __websocket );
	});

	var __websocket = {
		send: sendToAll
	}

}
