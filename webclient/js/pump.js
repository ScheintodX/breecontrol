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

			setStatus: ψ.dimmed( 'pumping' ),

			setMode: ψ.asModeColor( ψ.fill( 'mode' ) ),

			setTemp: ψ.scaled( ψ.text( 'temp' ), 0 ),

			setFill: ψ.ifchanged( function( value ) {

				var move = 50 - value * 50.0,
				    round = ( value * 100 )<<0
					;

				console.log( move );

				$svg('fill_content')
						.velocity( { translateY: move }, { duration: 500 } )
						;

				svg('fill').children[ 0 ].textContent = round + '%'
						;
			} ),

			gotData: function( data ) {

				if( !_svg ) return;

				if( !( 'devices' in data ) ) return;

				var msg = data.devices[ device ];

				if( 'pump' in msg ) {

					var pump = msg.pump;

					if( 'mode' in pump ) Pump.setMode( pump.mode.status );
					if( 'on' in pump ) Pump.setStatus( pump.on.status );
				}

				if( 'temp' in msg ) Pump.setTemp( msg.temp.status );
				if( 'fill' in msg ) Pump.setFill( msg.fill.status );
			}

		};

		$elem.on( 'load', function() {

			_svg = $elem.get( 0 ).contentDocument;

			// Don't animate stuff. Save power.
			/*
			$svg('fill_content')
					.expectOne()
					.velocity( { translateY: [0, 5] }, { duration: 2000, loop: true } )
					;
			*/
		} );

		return Pump;
	};

})($, BAG.Function);
