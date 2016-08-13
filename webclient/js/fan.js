"use strict";

/**
 * Operate one fan
 *
 * Multiple instances. Create with
 * <pre>
 *   var b = BAG.Fan( id );
 * </pre>
 */
BAG.Fan = (function($,Ψ){

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

		var Fan = {

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

				var fan = data.devices[ device ];

				console.log( fan );
			}

		};

		return Fan;
	};

})($, BAG.Function);
