"use strict";

/**
 * Operate one pump which is activated when a threshold value is reached
 *
 * Multiple instances. Create with
 * <pre>
 *   var b = BAG.Pump( id );
 * </pre>
 */
BAG.Pump = (function($,Ψ){

	// Constructor function
	return function( elem, device, passive ) {

		console.log( elem );

		passive = passive || true;

		var $elem = ( elem instanceof jQuery ? elem : $( elem ) )
				.expectOne(),
		    _svg = false;

		// Find svg element via dom
		function svg( id ) {
			return _svg.getElementById( id );
		}
		
		// Find svg element via jQuery
		function $svg( id ) {
			//return $elem.contents().find( '#' + id );
			return $(svg(id));
		}

		var ψ = Ψ( svg );

		var Pump = {

			setStatus: ψ.dimmed( 'status' ),

			setMode: ψ.asModeColor( ψ.fill( 'mode' ) ),

			setTemp: ψ.asDegree( ψ.text( 'temp' ) ),

			setFill: ψ.ifchanged( function( value ) {

				var move = 100 - value * 100.0,
				    round = ( value * 100 )<<0
					;

				$svg( 'fill' )
						.children[ 0 ].textContent = round + '%'
						;
			} ),

			gotData: function( data ) {

				if( !_svg ) return;

				if( !( 'devices' in data ) ) return;

				var msg = data.devices[ device ];

			}

		};

		$elem.on( 'load', function() {

			_svg = $elem.get( 0 ).contentDocument;

			// Animate stuff
			/*
			$svg('level')
					.expectOne()
					.velocity( { translateY: [0, 5] }, { duration: 2000, loop: true } )
					;
			*/
		} );

		return Pump;
	};

})($, BAG.Function);
