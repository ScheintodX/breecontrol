"use strict";

/**
 * Operate one Boiler
 *
 * Multiple instances. Create with
 * <pre>
 *   var b = BAG_Boiler( id );
 * </pre>
 */
var BAG_Boiler = (function($){

	// Constructor function
	return function( elem, boilerNo, passive ) {

		passive = passive || true;

		var $elem = $( elem ),
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

		function ifchanged( f ) {
			var _old;
			return function( val ) {
				if( _old == val ) return;
				_old = val;
				f( val );
			}
		}

		function text( id ) {
			return ifchanged( function( text ) {
				var svgE = svg( id );
				if( svgE ) svgE.children[ 0 ].textContent = text;
			} );
		}
		/*
		function degree( id ) {
			return ifchanged( function( val ) {
				var text;
				if( val !== 0 && !val ) text = '??';
				else text = val.toTemp();
				var svgE = svg( id );
				if( svgE ) svgE.children[ 0 ].textContent = text;
			} );
		}
		*/
		function asDegree( f, inclC, scale ) {

			if( !scale ) scale = 1;

			return function( val ) {
				var text;
				if( val !== 0 && !val ) text = '??';
				else {
					text = val.toTemp( scale );
					if( inclC ) text += 'C';
				}
				return f( text );
			}
		}
		function asHourMinSec( f ) {

			return function( val ) {
				var text;
				if( ! val ) text = '??:??:??';
				else {
					text = val.toHourMinSec()
				}
				return f( text );
			}
		}

		function asColor( f ) {

			function d2h(c) {
				var hex = (c<<0).toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			}
			function col( r,g,b ){
				return '#' + d2h(r) + d2h(g) + d2h(b);
			}

			return function( heat ) {

				var color = '#000000';
				if( heat !== 0 && !heat ) color='#77ff00';
				else {
					if( heat < 300 ){
						var perc = (heat/300);
						color = col( perc*255, perc*127, 0 );
					} else color = '#ffdd88';
				}
				f( color );
			}
		}

		function fill( id ) {
			return ifchanged( function( color ) {
				var svgE = svg( id );
				if( svgE ) svgE.style.fill = color;
			} );
		}

		function border( id ) {
			return ifchanged( function( on ) {
				var svgE = svg( id );
				if( svgE ) svgE.style.stroke = on ? '#ef2929' : '#2e3436';
			} );
		}

		function opacity( id ) {
			return ifchanged( function( value ) {
				var svgE = svg( id );
				if( svgE ) svgE.style.opacity = value;
			} );
		}

		function visible( id ) {
			return ifchanged( function( visible ) {
				var svgE = svg( id );
				if( svgE ) svgE.style.opacity = visible ? 1 : 0;
			} );
		}

		function override( f ) {
			return function( value ) {
				var isOverride = (
						typeof value != 'undefined' 
						&& value !== null
						&& value != 'off'
				);
				return f( isOverride );
			};
		}

		
		var Boiler = {

			setTempInnerStatus: asDegree( text( 'temp_inner_status' ), true ),
			setTempInnerNominal: asDegree( text( 'temp_inner_nominal' ) ),
			setTimeRemaining: asHourMinSec( text( 'time_remaining' ) ),
			setTimeElapsed: asHourMinSec( text( 'time_elapsed' ) ),
			setUpperTempStatus: asDegree( text( 'upper_temp_status' ) ),
			setUpperTempNominal: asDegree( text( 'upper_temp_nominal' ) ),
			setUpperTempIcon: asColor( fill( 'temp_upper_icon' ) ),
			setUpperHeater: border( 'temp_upper_icon' ),
			setLowerTempStatus: asDegree( text( 'lower_temp_status' ) ),
			setLowerTempNominal: asDegree( text( 'lower_temp_nominal' ) ),
			setLowerTempIcon: asColor( fill( 'temp_lower_icon' ) ),
			setLowerHeater: border( 'temp_lower_icon' ),
			setLid: visible( 'lid' ),
			setLidOverride: override( visible( 'lid_override' ) ),
			setAggitator: ifchanged( function( on ) {

				var aggi = svg('aggitator');

				if( on ) {
					aggi.style.opacity = .8;
					$(aggi).velocity(
							{ opacity: [ .8, .9 ] },
							{ duration: 317, loop: true }
					);
				} else {
					$(aggi).velocity( "stop" );
					aggi.style.opacity = .2;
				}

			} ),
			setFill: ifchanged( function( value ) {

				var move = 100-value*100.0;

				// Using plain js and attribute in svg
				/*
				svg( 'fill_content' )
						.setAttribute( 'transform', 'translate( 0, ' + move + ' )' )
						;
				*/
				
				// Using jQuery and Velocity
				$svg('fill_content')
						.velocity( { translateY: move }, { duration: 500 } )
						;
					
			} ),
			setFillOverride: override( visible( 'fill_override' ) ),

			gotData: function( data ) {

				if( !_svg ) return;

				if( !( 'boilers' in data ) ) return;

				var boiler = data.boilers[ 'boiler' + boilerNo ]
					;

				console.log( boiler );

				Boiler.setAggitator( boiler.aggitator.status );
				Boiler.setFill( boiler.fill.status );
				Boiler.setFillOverride( boiler.fill.override );
				Boiler.setLid( boiler.lid.status );
				Boiler.setLidOverride( boiler.lid.override );

				Boiler.setTempInnerStatus( boiler.temp.status );
				Boiler.setTempInnerNominal( boiler.temp.nominal );

				Boiler.setTimeRemaining( boiler.script.remaining );
				Boiler.setTimeElapsed( boiler.script.elapsed );

				Boiler.setUpperTempStatus( boiler.upper.temp.status );
				Boiler.setUpperTempNominal( boiler.upper.temp.nominal );
				Boiler.setUpperTempIcon( boiler.upper.temp.status );
				Boiler.setUpperHeater( boiler.upper.heater.status );

				Boiler.setLowerTempStatus( boiler.lower.temp.status );
				Boiler.setLowerTempNominal( boiler.lower.temp.nominal );
				Boiler.setLowerTempIcon( boiler.lower.temp.status );
				Boiler.setLowerHeater( boiler.lower.heater.status );

			},

			ready: function() {
				return _svg !== false;
			}
		}

		$elem.on( 'load', function() {

			_svg = $elem.get( 0 ).contentDocument;

			// Animate stuff
			$svg('fill_content_anim')
					.expectOne()
					.velocity( { translateY: [0, 5] }, { duration: 2000, loop: true } )
					;
			/*
			$svg('beer')
					.expectOne()
					.velocity( { fill: ['#f4da00','#f4d000'] }, { duration: 375, loop: true } )
					;
					*/

		} );


		return Boiler;
	};

})($);
