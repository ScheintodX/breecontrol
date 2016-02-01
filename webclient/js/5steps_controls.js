"use strict";

var BAG_5Steps_Controls = (function($){

	return function( elem, device ) {

		function gotData( data ) {

			console.log( data );
		}

		return {

			name: '5steps',

			gotData: gotData,

			onControl: function( onControl ) {

				_onControl = onControl;
			}
		}
	}
})($);
