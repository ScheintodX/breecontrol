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

		var _elem = $( elem ),
		    _svg = false;

		_elem.on( 'load', function() {

			_svg = _elem.get( 0 ).contentDocument;

			Boiler.setTempInnerStatus( "ti_status°" );
			Boiler.setTempInnerNominal( "ti_nominal" );
			Boiler.setAggitator( false );
			Boiler.setTimeRemaining( "t_rem" );
			Boiler.setTimeElapsed( "t_elap" );
			Boiler.setUpperTempIcon( "#00ff00" );
			Boiler.setLowerTempIcon( "#0000ff" );
			Boiler.setFill( 1 );
			Boiler.setLid( 1 );

		} );

		function svg( id ) {
			return _svg ? _svg.getElementById( id ) : false;
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
				console.log( color );
				var svgE = svg( id );
				if( svgE ) svgE.style.fill = color;
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
				if( svgE ) svgE.style.visibility = visible ? 'visible' : 'hidden';
			} );
		}

		
		var Boiler = {

			setTempInnerStatus: text( 'temp_inner_status' ),
			setTempInnerNominal: text( 'temp_inner_nominal' ),
			setTimeRemaining: text( 'time_remaining' ),
			setTimeElapsed: text( 'time_elapsed' ),
			setUpperTemp: text( 'upper_temp' ),
			setUpperPower: text( 'upper_power' ),
			setUpperTempIcon: color( 'temp_upper_icon' ),
			setLowerTemp: text( 'lower_temp' ),
			setLowerPower: text( 'lower_power' ),
			setLowerTempIcon: color( 'temp_lower_icon' ),
			setLid: visible( 'lid' ),
			setAggitator: ifchanged( function( on ) {

				if( on ) {
					_elem.contents().find('#aggitator')
							.velocity( { opacity: [ .7, .9 ] }, { duration: 317, loop: true } )
							;
				} else {
					_elem.contents().find('#aggitator')
							.velocity( { opacity: .2 }, { duration: 700 } )
				}

			} ),
			setFill: ifchanged( function( value ) {

				var move = 100-value*100.0;

				// Using plain js and attribute in svg
				svg( 'fill_content' )
						.setAttribute( 'transform', 'translate( 0, ' + move + ' )' )
						;
				
				/*
				// Using jQuery and Velocity
				_elem.contents().find('#fill_content')
						//.velocity( { translateY: move }, { duration: 0 } )
						.velocity( { translateY: move }, { duration: 2000 } )
						;
				*/
					
			} ),

			gotData: function( data ) {

				if( !_svg ) return;

				var boiler = data.boilers[ 'boiler' + boilerNo ]
					;

				console.log( boiler );

				Boiler.setAggitator( boiler.aggitator.status );
				Boiler.setFill( boiler.fill.status );
				Boiler.setLid( boiler.lid.status );

				Boiler.setTempInnerStatus( boiler.temp.status.toTemp() );
				Boiler.setTempInnerNominal( boiler.temp.nominal.toTempC() );

				Boiler.setTimeRemaining( boiler.script.remaining.toHourMinSec() );
				Boiler.setTimeElapsed( boiler.script.elapsed.toHourMinSec() );

				Boiler.setUpperTemp( boiler.jacket.upper.temp.status.toTemp(1) );
				Boiler.setUpperPower( boiler.jacket.upper.power.status.toPercent() );
				Boiler.setUpperTempIcon( p2C( boiler.jacket.upper.power.status ) );

				Boiler.setLowerTemp( boiler.jacket.lower.temp.status.toTemp(1) );
				Boiler.setLowerPower( boiler.jacket.lower.power.status.toPercent() );
				Boiler.setLowerTempIcon( p2C( boiler.jacket.lower.power.status ) );
			},

			ready: function() {
				return _svg !== false;
			}
		}

		console.log( "ANIM" );
		// Animate stuff
		_elem.contents().find('#fill_content')
				.velocity( { translateY: [0, 50] }, { duration: 2000, loop: true } )
				;
		_elem.contents().find('#bier')
				.velocity( { fill: ['#f4da00','#aaaaaa'] }, { duration: 1000, loop: true } )
				;

		return Boiler;
	};

})($);
