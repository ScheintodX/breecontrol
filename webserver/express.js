"use strict";

var log = require( './logging.js' );
var E = require( './E.js' );
var async = require( 'async' );

var Assert = require( './assert.js' );

var server = require( 'http' ).createServer(),
    url = require('url'),
	WebSocketServer = require( 'ws' ).Server,
	wss,
	express = require( 'express' ),
	app,
	PORT
	;


var _onData = false;
var _hello = false;

function onSendError( error ) {

	E.rr( "Error sending", error );
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

	//log.trace( "send (" + wss.connections.length + ")", text );

	wss.clients.forEach( function( client ) {

		if( client.readyState != client.OPEN ){

			E.rr( "Clinet not ready" );

		} else {
			client.send( text, onSendError );
		}

	} );
}


function gotClose( conn, code, reason ) {

	log.trace( 'Connection closed', code, reason );
}


function gotError( conn, err ) {

	log.warn( err );
}


function gotMessage( message ) {

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

	//var location = url.parse( conn.upgradeReq.url, true );

	conn.on( 'message', gotMessage );
	conn.on( 'error', gotError );
	conn.on( 'close', gotClose );

	setTimeout( function() {

		conn.send( JSON.stringify( _hello ) );

	}, 0 );
}


function startWSS( server, done ){

	wss = new WebSocketServer( { server: server } );
	wss.on( 'connection', gotConnection );
	wss.on( 'error', gotError );

	// Constructor has a callback but it's only called if started on dedicated port
	return done();
}


function startHttpServer( server, app, done ){

	server.on( 'request', app );
	server.listen( PORT, done );
}


module.exports = function( onData, hello, config, done ) {

	Assert.present( 'onData', onData );
	Assert.present( 'config', config );
	Assert.present( 'done', done );

	log.trace( "Express starting" );

	PORT = config.port;

	var __websocket = {
		send: sendToAll
	}

	_hello = hello;
	_onData = onData;

	app = express();
	app.use( express.static( '../webclient' ) );

	async.series( [

		function( done ){ startWSS( server, done ); },
		function( done ){ startHttpServer( server, app, done ); }

	], function( err ){

		return done( err, __websocket );
	} );

}
