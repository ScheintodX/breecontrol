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

		function p2C( power ) {

				return '#'+(power*255*256*256).toString(16);
		}

		function color( id ) {
			return ifchanged( function( color ) {
				var svgE = svg( id );
				if( svgE ) svgE.style.fill = color;
			} );
		}

		function border( id ) {
			return ifchanged( function( on ) {
				console.log( on );
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

			setTempInnerStatus: text( 'temp_inner_status' ),
			setTempInnerNominal: text( 'temp_inner_nominal' ),
			setTimeRemaining: text( 'time_remaining' ),
			setTimeElapsed: text( 'time_elapsed' ),
			setUpperTemp: text( 'upper_temp' ),
			setUpperPower: text( 'upper_power' ),
			setUpperTempIcon: color( 'temp_upper_icon' ),
			setUpperHeater: border( 'temp_upper_icon' ),
			setLowerTemp: text( 'lower_temp' ),
			setLowerPower: text( 'lower_power' ),
			setLowerTempIcon: color( 'temp_lower_icon' ),
			setLowerHeater: border( 'temp_lower_icon' ),
			setLid: visible( 'lid' ),
			setLidOverride: override( visible( 'lid_override' ) ),
			setAggitator: ifchanged( function( on ) {

				var aggi = svg('aggitator');

				if( on ) {
					$(aggi).velocity(
							{ opacity: .7 },
							{ duration: 400 }

							).velocity(
							{ opacity: [ .8, .9 ] },
							{ duration: 317, loop: true }
					);
				} else {
					$(aggi).velocity( "stop" ).velocity(
							{ opacity: .2 },
							{ duration: 400, loop: false }
					) ;
					//aggi.style.opacity = .2;
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

				Boiler.setAggitator( boiler.aggitator.status );
				Boiler.setFill( boiler.fill.status );
				Boiler.setFillOverride( boiler.fill.override );
				Boiler.setLid( boiler.lid.status );
				Boiler.setLidOverride( boiler.lid.override );

				Boiler.setTempInnerStatus( boiler.temp.status.toTemp() );
				Boiler.setTempInnerNominal( boiler.temp.nominal.toTempC() );

				Boiler.setTimeRemaining( boiler.script.remaining.toHourMinSec() );
				Boiler.setTimeElapsed( boiler.script.elapsed.toHourMinSec() );

				Boiler.setUpperTemp( boiler.jacket.upper.temp.status.toTemp(1) );
				Boiler.setUpperPower( boiler.jacket.upper.power.status.toPercent() );
				Boiler.setUpperTempIcon( p2C( boiler.jacket.upper.power.status ) );
				Boiler.setUpperHeater( boiler.jacket.upper.heater.status );

				Boiler.setLowerTemp( boiler.jacket.lower.temp.status.toTemp(1) );
				Boiler.setLowerPower( boiler.jacket.lower.power.status.toPercent() );
				Boiler.setLowerTempIcon( p2C( boiler.jacket.lower.power.status ) );
				Boiler.setLowerHeater( boiler.jacket.lower.heater.status );

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
