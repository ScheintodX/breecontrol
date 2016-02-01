"use strict";

/**
 * Manage communication
 *
 * Only single instance
 */
BAG.Com = (function(){

	var _callback = false,
		_websocket = false;

	function gotError( what ) {

		console.warn( "ERROR", what, _websocket );

		if( _websocket.readyState > 1 ) { //CLOSING,CLOSED

			console.info( "Reconnecting in 2" );

			setTimeout( reconnect, 2000 );
		}

	}

	function gotOpen( what ) {

		console.info( "OPEN", what );
	}

	function gotData( what ) {

		var data = JSON.parse( what.data );

		//console.trace( data );

		if( _callback ) _callback( data );
	}

	function gotClose( what ) {

		console.log( what );

		console.log( "Reconnecting in 5" );

		setTimeout( reconnect, 5000 );
	}

	function connect() {

		//_websocket = new WebSocket( BAG.Config.com.url );
		_websocket = new WebSocket( 'ws://' + location.host + ':8765/' );
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

	function watchdog() {

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

			setInterval( watchdog, 500 );

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
