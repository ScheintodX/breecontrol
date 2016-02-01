"use strict";

/**
 * Manage communication
 *
 * Only single instance
 */
BAG.Com = (function($){

	var _callback = false;

	function error( what ) {

		console.warn( what );
	}

	var Com = {

		onData: function( callback ) {

			_callback = callback;

			return Com;
		},

		request: function() {

			$.ajax( '/bag/server' )
				.then( _callback )
				.fail( error )
				;
		},

		start: function() {

			setInterval( Com.request, 2000 );
			
			return Com;
		}
	};

	return Com;

})($);
