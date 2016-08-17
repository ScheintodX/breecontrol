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

			outdoor: {
				setTemp: ψ.scaled( ψ.text( 'outdoor_temp' ), 0 ),
				setHumidityRel: ψ.scaled( ψ.text( 'outdoor_humidity_rel' ), 0 ),
				setHumidityAbs: ψ.scaled( ψ.text( 'outdoor_humidity_abs' ), 0 ), 
			},
			indoor: {
				setTemp: ψ.scaled( ψ.text( 'indoor_temp' ), 0 ),
				setHumidityRel: ψ.scaled( ψ.text( 'indoor_humidity_rel' ), 0 ),
				setHumidityAbs: ψ.scaled( ψ.text( 'indoor_humidity_abs' ), 0 ), 
			},

			setStatus: ψ.dimmed( 'status' ),

			setMode: ψ.asModeColor( ψ.fill( 'mode' ) ),

			/*
			setFill: ψ.ifchanged( function( value ) {

				var move = 100 - value * 100.0,
				    round = ( value * 100 )<<0
					;

				$svg( 'fill' )
						.children[ 0 ].textContent = round + '%'
						;
			} ),
			*/

			gotData: function( data ) {

				if( !_svg ) return;

				if( !( 'devices' in data ) ) return;

				var msg = data.devices[ device ];

				if( 'outdoor' in msg ) {
					var met = msg.outdoor,
					    Met = Fan.outdoor;
					if( 'temp' in met ) Met.setTemp( met.temp.status );
					if( 'humidity_rel' in met ) Met.setHumidityRel( met.humidity_rel.status );
					if( 'humidity_abs' in met ) Met.setHumidityAbs( met.humidity_abs.status );
				}
				if( 'indoor' in msg ) {
					var met = msg.indoor,
					    Met = Fan.indoor;
					if( 'temp' in met ) Met.setTemp( met.temp.status );
					if( 'humidity_rel' in met ) Met.setHumidityRel( met.humidity_rel.status );
					if( 'humidity_abs' in met ) Met.setHumidityAbs( met.humidity_abs.status );
				}
				if( 'fan' in msg ) {

					var fan = msg.fan;

					if( 'on' in fan ) {

						Fan.setStatus( fan.on.status );
					}

					if( 'mode' in fan ) {

						Fan.setMode( fan.mode.status );
					}
				}
			}

		};

		$elem.on( 'load', function() {

			_svg = $elem.get( 0 ).contentDocument;

		} );

		return Fan;
	};

})($, BAG.Function);
