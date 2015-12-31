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

	return function( elem, boilerNo, passive ) {

		passive = passive || true;

		var _elem = $( elem ),
		    _svg = false;

		_elem.on( 'load', function() {

			_svg = _elem.get( 0 ).contentDocument;

			Chart.setTemp1( 'temp1' ),
			Chart.setTemp2( 'temp2' ),
			Chart.setTemp3( 'temp3' ),
			Chart.setTempBar( .20 ),
			Chart.setTempStatus( 'temp_status' ),

			Chart.setTime1( 'time1' ),
			Chart.setTime2( 'time2' ),
			Chart.setTime3( 'time3' ),
			Chart.setTimeBar( .20 ),
			Chart.setTimeStatus( 'time_status' )

			/*
			var i=0, up=true;;

			setInterval( function() {
				
				Chart.setTimeBar( i );
				Chart.setTempBar( i );

				if( up ) {
					i+=.02;
					if( i>=1 ) up=false;
				} else {
					i-=.02;
					if( i<=0 ) up=true;
				}

			}, 100 );
			*/

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

		function moveHor( id, inScale, outScale ) {

			return function doMoveHor( percent ) {

				var svgE = svg( id );
				if( !svgE ) return;

				var x = scaleCalc( percent, inScale, outScale );

				moveRel( svgE, x, 0 );
			}
		}

		var Chart = {

			setTemp1: text( 'temp1' ),
			setTemp2: text( 'temp2' ),
			setTemp3: text( 'temp3' ),
			setTempBar: moveVert( 'temp_bar', 1, 130 ),
			setTempStatus: text( 'temp_status' ),

			setTime1: text( 'time1' ),
			setTime2: text( 'time2' ),
			setTime3: text( 'time3' ),
			setTimeBar: moveHor( 'time_bar', 1, 300 ),
			setTimeStatus: text( 'time_status' ),

			gotData: function( data ) {

				if( ! Chart.ready() ) return;

				var boiler = data.boilers[ 'boiler' + boilerNo ],
					script = boiler.script
					;

				Chart.setTemp1( script.steps[ 0 ].temp.toTemp() );
				Chart.setTemp2( script.steps[ 2 ].temp.toTemp() );
				Chart.setTemp3( script.steps[ 4 ].temp.toTemp() );
				Chart.setTempBar( boiler.temp.status / 100 );
				Chart.setTempStatus( boiler.temp.status );

				Chart.setTime1( script.steps[ 1 ].time.toMinSec() );
				Chart.setTime2( script.steps[ 3 ].time.toMinSec() );
				Chart.setTime3( script.steps[ 5 ].time.toMinSec() );
				var elapsed = script.current.elapsed,
					remaining = script.current.remaining,
					total = elapsed + remaining,
					percent = elapsed / total
					;
				Chart.setTimeBar( script.current.index /6 + percent /6 ); 
				Chart.setTimeStatus( '‒ ' + remaining.toMinSec() );
			},

			ready: function() {
				return _svg !== false;
			}
		}

		return Chart;
	};

})($);
