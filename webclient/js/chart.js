"use strict";

/**
 * Operate one Chart
 *
 * Multiple instances. Create with
 * <pre>
 *   var c = BAG_Chart( id );
 * </pre>
 */
var BAG_Chart = (function($){

	//var BOUNDS = [ 30, 60, 140, 220, 300, 330 ];
	var BOUNDS = [
			[ 30, 30 ],		// notify (run)
			[ 30, 60 ],		// PREHEAT
			[ 60, 60 ],		// notify (pause)
			[ 60, 60 ],		// pause
			[ 60, 60 ],		// notify (run)
			[ 60, 80 ],		// 1. HEAT
			[ 80, 140 ],	// 1. HOLD
			[ 140, 165 ],	// 2. HEAT
			[ 165, 220 ],	// 2. HOLD
			[ 220, 255 ],	// 3. HEAT
			[ 255, 300 ],	// 3. HOLD
			[ 300, 330 ],	// POSTHEAT
			[ 330, 330 ]	// notify (done)
	];

	return function( elem, device, passive ) {

		passive = passive || true;

		var $elem = $( elem ).expectOne(),
		    _svg = false;

		$elem.on( 'load', function() {

			_svg = $elem.get( 0 ).contentDocument;

		} );

		function svg( id ) {
			return _svg ? _svg.getElementById( id ) : false;
		}

		function text( id ) {
			return function( text ) {
				var svgE = svg( id );
				if( svgE ) svgE.children[ 0 ].textContent = text;
			}
		}

		function moveRel( svgE, x, y ) {

			svgE.setAttribute( 'transform', 'translate( ' + x + ', ' + y + ' )' );
		}

		function scaleCalc( v, inScale, outScale ) {

			return v / inScale * outScale;
		}

		function moveVert( id, inScale, outScale ) {

			return function doMoveVert( percent ) {

				var svgE = svg( id );
				if( !svgE ) return;

				var y = scaleCalc( inScale-percent, inScale, outScale );

				moveRel( svgE, 0, y );

			}
		}

		/*
		function moveHor( id, inScale, outScale ) {

			return function doMoveHor( percent ) {

				var svgE = svg( id );
				if( !svgE ) return;

				var x = scaleCalc( percent, inScale, outScale );

				moveRel( svgE, x, 0 );
			}
		}
		*/
		function moveHor( id ) {

			return function doMoveHor( step, percent ) {

				var svgE = svg( id );
				if( !svgE ) return;

				var b = BOUNDS[ step ],
				    diff = b[ 1 ] - b[ 0 ],
					x = b[ 0 ] + diff * percent;

				moveRel( svgE, x, 0 );
			}
		}

		var Chart = {

			setTemp0: text( 'temp0' ),
			setTemp1: text( 'temp1' ),
			setTemp2: text( 'temp2' ),
			setTemp3: text( 'temp3' ),
			setTemp4: text( 'temp4' ),
			//setTempBar: moveVert( 'temp_bar', 1, 130 ),
			//setTempStatus: text( 'temp_status' ),

			setTime1: text( 'time1' ),
			setTime2: text( 'time2' ),
			setTime3: text( 'time3' ),
			//setTimeBar: moveHor( 'time_bar', 1, 300 ),
			setTimeBar: moveHor( 'time_bar' ),
			setTimeStatus: text( 'time_status' ),

			gotData: function( data ) {

				if( ! Chart.ready() ) return;

				if( !( 'boilers' in data ) ) return;

				var boiler = data.boilers[ device ];

				if( !( 'script' in boiler ) ) return;

				var script = boiler.script;

				console.log( script );

				Chart.setTemp0( script.steps[ 0 ].heat.toTemp() );
				Chart.setTemp1( script.steps[ 1 ].heat.toTemp() );
				Chart.setTemp2( script.steps[ 2 ].heat.toTemp() );
				Chart.setTemp3( script.steps[ 3 ].heat.toTemp() );
				Chart.setTemp4( script.steps[ 4 ].heat.toTemp() );
				//Chart.setTempBar( boiler.temp.status / 100 );
				//Chart.setTempStatus( boiler.temp.status );

				Chart.setTime1( script.steps[ 1 ].hold.toMinSec() );
				Chart.setTime2( script.steps[ 2 ].hold.toMinSec() );
				Chart.setTime3( script.steps[ 3 ].hold.toMinSec() );
				if( script.current ) {
					
					var current = script.current,
						elapsed = current.elapsed,
						remaining = current.remaining,
						total = elapsed + remaining,
						percent = total != 0 ? elapsed / total : 0
						;
					//Chart.setTimeBar( script.current.index /6 + percent /6 ); 
					Chart.setTimeBar( current.index, percent ); 
					Chart.setTimeStatus( '‒ ' + remaining.toMinSec() );
				} else {
					Chart.setTimeBar( 0 );
					Chart.setTimeStatus( '??' );
				}
			},

			ready: function() {
				return _svg !== false;
			}
		}

		return Chart;
	};

})($);
