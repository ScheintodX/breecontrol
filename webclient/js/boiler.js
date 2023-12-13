"use strict";

/**
 * Operate one Boiler
 *
 * Multiple instances. Create with
 * <pre>
 *   var b = BAG.Boiler( id );
 * </pre>
 */
BAG.Boiler = (function($,Ψ){

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

		var Boiler = {

			setTempInnerStatus: ψ.asDegree( ψ.text( 'temp_inner_status' ), true ),
			setTempInnerNominal: ψ.asDegree( ψ.text( 'temp_inner_nominal' ) ),
			setTimeRemaining: ψ.asHourMinSec( ψ.text( 'time_remaining' ) ),
			setTimeElapsed: ψ.asHourMinSec( ψ.text( 'time_elapsed' ) ),
			setUpperTempStatus: ψ.asDegree( ψ.text( 'upper_temp_status' ) ),
			setUpperTempNominal: ψ.asDegree( ψ.text( 'upper_temp_nominal' ) ),
			setUpperTempIcon: ψ.asTempColor( ψ.fill( 'temp_upper_icon' ) ),
			setUpperHeater: ψ.border( 'temp_upper_icon' ),
			setLowerTempStatus: ψ.asDegree( ψ.text( 'lower_temp_status' ) ),
			setLowerTempNominal: ψ.asDegree( ψ.text( 'lower_temp_nominal' ) ),
			setLowerTempIcon: ψ.asTempColor( ψ.fill( 'temp_lower_icon' ) ),
			setLowerHeater: ψ.border( 'temp_lower_icon' ),
			setJacketTempStatus: ψ.asDegree( ψ.text( 'jacket_temp_status' ) ),
			setJacketTempNominal: ψ.asDegree( ψ.text( 'jacket_temp_nominal' ) ),
			setJacketTempIcon: ψ.asTempColor( ψ.fill( 'temp_jacket_icon' ) ),
			setJacketCooler: ψ.border( 'temp_jacket_icon' ),
			setLid: ψ.visible( 'lid' ),
			setLidOverride: ψ.override( ψ.visible( 'lid_override' ) ),
			setMode: ψ.oneOf( 'mode_', [ 'run', 'pause', 'stop' ] ),

			setAggitator: ψ.ifchanged( function( on ) {

				svg('aggitator').style.opacity = (on ? .8 : .2);
			} ),

			setFill: ψ.ifchanged( function( value ) {

				var move = 100 - value * 100.0,
				    round = ( value * 100 )<<0;

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

				svg( 'fill' )
						.children[ 0 ].textContent = round + '%';
						;
			} ),

			setFillOverride: ψ.override( ψ.visible( 'fill_override' ) ),

			gotData: function( data ) {

				if( !_svg ) return;

				if( !( 'devices' in data ) ) return;

				var boiler = data.devices[ device ];

				if( 'aggitator' in boiler ) {
					Boiler.setAggitator( boiler.aggitator.status );
				}

				if( 'fill' in boiler ) {
					Boiler.setFill( boiler.fill.status );
					Boiler.setFillOverride( boiler.fill.override );
				}

				if( 'lid' in boiler ) {
					Boiler.setLid( boiler.lid.status );
					Boiler.setLidOverride( boiler.lid.override );
				}

				if( 'temp' in boiler ) {
					Boiler.setTempInnerStatus( boiler.temp.status );
					Boiler.setTempInnerNominal( boiler.temp.nominal );
				}

				if( 'upper' in boiler ) {
					if( 'temp' in boiler.upper ) {
						Boiler.setUpperTempStatus( boiler.upper.temp.status );
						Boiler.setUpperTempNominal( boiler.upper.temp.nominal );
						Boiler.setUpperTempIcon( boiler.upper.temp.status );
					}
					if( 'heater' in boiler.upper ) {
						Boiler.setUpperHeater( boiler.upper.heater.status );
					}
				}

				if( 'lower' in boiler ) {
					if( 'temp' in boiler.lower ) {
						Boiler.setLowerTempStatus( boiler.lower.temp.status );
						Boiler.setLowerTempNominal( boiler.lower.temp.nominal );
						Boiler.setLowerTempIcon( boiler.lower.temp.status );
					}
					if( 'heater' in boiler.lower ) {
						Boiler.setLowerHeater( boiler.lower.heater.status );
					}
				}

				if( 'jacket' in boiler ) {
					if( 'temp' in boiler.jacket ) {
						Boiler.setJacketTempStatus( boiler.jacket.temp.status );
						Boiler.setJacketTempNominal( boiler.jacket.temp.nominal );
						Boiler.setJacketTempIcon( boiler.jacket.temp.status );
					}
					if( 'heater' in boiler.jacket ) {
						Boiler.setJacketHeater( boiler.jacket.heater.status );
					}
				}

				if( 'script' in boiler ) {
					var script = boiler.script;
					Boiler.setTimeRemaining( script.remaining );
					Boiler.setTimeElapsed( script.current.remaining );
					Boiler.setMode( script.mode );
				} else {
					Boiler.setTimeRemaining( undefined );
					Boiler.setTimeElapsed( undefined );
					Boiler.setMode( 'unknown' );
				}

			},

			ready: function() {
				return _svg !== false;
			}
		};

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

})($, BAG.Function);
