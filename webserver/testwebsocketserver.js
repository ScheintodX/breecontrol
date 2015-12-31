"use strict";

/*
var ws = require( 'nodejs-websocket' );

function gotText( conn, str ) {

	console.log( 'Received '+str );
}

function gotClose( conn, code, reason ) {

	console.log( 'Connection closed', code, reason );
}

function gotError( conn, err ) {

	console.log( "RR", err );
}

function gotConnection( conn ) {
	
	console.log( "New connection %s", conn.key );

	conn.on( 'text', function( str ) { gotText( conn, str ); } );
	conn.on( 'close', function( code, reason ){ gotClose( conn, code, reason ); } );
	conn.on( 'error', function( err ){ gotClose( conn, err ); } );

}

var _wsServer = ws.createServer( gotConnection );
_wsServer.listen( 8765, function() {
		console.log( 'Websocket LISTENING' );
} );
*/

function onData( data ) {
	console.log( data );
}

require( './websocket.js' )( onData, { port: 8765, interval: 1000 }, {}, function(){ console.log( "done" ) });
