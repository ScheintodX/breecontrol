import { log } from './logging.js';
import { E } from './E.js';

import { Assert } from './assert.js';

import Http from 'http';
import { WebSocketServer } from 'ws';
import Express from 'express';

var _onData = false;
var _hello = false;

var _wss;

function onSendError( error ) {

	if( error ) E.rr( "Error sending", error );
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

	_wss.clients.forEach( function( client ) {

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
		_onData( data );
	} catch( ex ) {
		return log.ex( ex, 'Processing Event: ', data );
	}
}


function gotConnection( conn ) {

	conn.on( 'message', gotMessage );
	conn.on( 'error', gotError );
	conn.on( 'close', gotClose );

	setTimeout( function() {

		conn.send( JSON.stringify( _hello ) );

	}, 0 );
}


async function startWSS( server ){

	var wss = new WebSocketServer( { server } );
	wss.on( 'connection', gotConnection );
	wss.on( 'error', gotError );

	return wss;
}

function startHttpServer( server, app, port ){

	return new Promise( resolve => {

		server.on( 'request', app );
		server.listen( port, 'localhost', () => resolve( server ) );
	} );
}


export default async function Websocket( onData, hello, config ) {
	
	Assert.present( 'onData', onData );
	Assert.present( 'config', config );

	log.trace( "Express starting" );

	_hello = hello;
	_onData = onData;

	var __websocket = {
		send: sendToAll
	}

	const server = Http.createServer();

	const app = Express();
	app.use( Express.static( '../webclient' ) );

	_wss = await startWSS( server );

	await startHttpServer( server, app, config.port );

	return __websocket;
}
