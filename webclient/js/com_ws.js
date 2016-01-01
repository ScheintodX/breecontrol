"use strict";

/**
 * Manage communication
 *
 * Only single instance
 */
var BAG_Com = (function($){

	//var _URL_ = 'ws://10.3.2.1:8765/';
	var _URL_ = 'ws://localhost:8765/';

	var _callback = false,
		_websocket = false;

	function gotError( what ) {

		console.warn( "ERROR", what, _websocket );

		if( _websocket.readyState > 1 ) { //CLOSING,CLOSED

			console.log( "Reconnecting in 2" );

			setTimeout( reconnect, 2000 );
		}

	}

	function gotOpen( what ) {

		console.log( "OPEN", what );
	}

	function gotData( what ) {

		var data = JSON.parse( what.data );

		console.log( data );

		_callback( data );
	}

	function gotClose( what ) {

		console.log( what );

		console.log( "Reconnecting in 5" );

		setTimeout( reconnect, 5000 );
	}

	function connect() {

		_websocket = new WebSocket( _URL_ );
		_websocket.onmessage = gotData;
		_websocket.onopen = gotOpen;
		_websocket.gotclose = gotClose;
		_websocket.onerror = gotError;
	}

	function reconnect() {

		if( _websocket.readystate < 2 ) 
				console.warn( "already connecting/-ted" );

		connect();
	}

	function monitor() {

		if( _websocket.readyState > 1 ){
			reconnect();
		}
	}

	var Com = {

		onData: function( callback ) {

			_callback = callback;

			return Com;
		},

		start: function() {

			connect();

			setInterval( monitor, 1000 );

			return Com;
		},

		send: function( data ) {

			switch( typeof data ) {
				case "undefined": data = "*empty*"; break;
				case "function": throw "Cannot send functions, sorry!";
				case "object": 
					data = JSON.stringify( data );
					break;
				case "string": break;
				default:
					data = String( data );
			}

			console.debug( "send", data );

			_websocket.send( data );
		}

	};

	// Fix f. firefox bug
	$(window).on('beforeunload', function(){
	    _websocket.close();
	});

	return Com;

})($);
