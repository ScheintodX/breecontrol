"use strict";

/**
 * Information from powerguard
 */
BAG.Powerguard = (function($,Ψ){

	function fmt( x ) {

		if( x === null ) return x;

		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}

	// Constructor function
	return function( elem, device, passive ) {

		passive = passive || true;

		var Powerguard = {

			used: 0,
			max: 0,

			gotData: function( data ) {

				if( !( 'devices' in data ) ) return;

				var msg = data.devices[ device ];

				var $pg = $( 'section.device.powerguard' );
				    ;

				$pg.find( '#power_used' ).text( fmt( msg.power_used.status ) );
				$pg.find( '#power_max' ).text( fmt( msg.power_max.status ) );
			}

		};

		return Powerguard;
	};

})($, BAG.Function);
