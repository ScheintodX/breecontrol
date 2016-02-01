"use strict";

/**
 * Operate one Chart
 *
 * Multiple instances. Create with
 * <pre>
 *   var c = BAG.Xxx_Chart( id );
 * </pre>
 */
BAG.Script_5Steps_Chart = (function($,Ψ){

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
			[ 300, 326 ],	// POSTHEAT
			[ 326, 326 ]	// notify (done)
	];

	return function( elem, device, passive ) {

		passive = passive || true;

		var $elem = ( elem instanceof jQuery ? elem : $( elem ) )
				.expectOne(),
		    _svg = false;

		var $chart = $('<object class="chart" data="5steps.svg" />' )
				.prependTo( $elem )
				.on( 'load', function() {
					console.log( 'chart loaded' );
					_svg = $chart.get( 0 ).contentDocument;
				} );
				;

		function svg( id ) {
			return _svg ? _svg.getElementById( id ) : false;
		}

		var ψ = Ψ( svg );

		function moveRel( svgE, x, y ) {

			svgE.setAttribute( 'transform', 'translate( ' + x + ', ' + y + ' )' );
		}

		function scaleCalc( v, inScale, outScale ) {

			return v / inScale * outScale;
		}

		function moveVert( id, inScale, outScale ) {

			return ψ.ifchanged( function( percent ) {

				var svgE = svg( id );
				if( !svgE ) return;

				var y = scaleCalc( inScale-percent, inScale, outScale );

				moveRel( svgE, 0, y );

			} );
		}

		function moveHor( id ) {

			var _step, _percent;

			return function( step, percent ) {

				if( step === _step && percent === _percent ) return;
				_step = step;
				_percent = percent;

				var svgE = svg( id );
				if( !svgE ) return;

				var b = BOUNDS[ step ],
				    diff = b[ 1 ] - b[ 0 ],
					x = b[ 0 ] + diff * percent;

				moveRel( svgE, x, 0 );
			}
		}

		var _lastData;

		var Chart = {

			setTemp0: ψ.asDegree( ψ.text( 'temp0' ), true ),
			setTemp1: ψ.asDegree( ψ.text( 'temp1' ), true ),
			setTemp2: ψ.asDegree( ψ.text( 'temp2' ), true ),
			setTemp3: ψ.asDegree( ψ.text( 'temp3' ), true ),
			setTemp4: ψ.asDegree( ψ.text( 'temp4' ), true ),
			//setTempBar: moveVert( 'temp_bar', 1, 130 ),
			//setTempStatus: text( 'temp_status' ),

			setTime1: ψ.asMinSec( ψ.text( 'time1' ) ),
			setTime2: ψ.asMinSec( ψ.text( 'time2' ) ),
			setTime3: ψ.asMinSec( ψ.text( 'time3' ) ),
			//setTimeBar: moveHor( 'time_bar', 1, 300 ),
			setTimeBar: moveHor( 'time_bar' ),
			setTimeStatus: ψ.asMinSec( ψ.text( 'time_status' ) ),

			gotData: function( data ) {

				if( ! Chart.ready() ) return;

				if( !( 'boilers' in data ) ) return;

				var boiler = data.boilers[ device ];

				if( !( 'script' in boiler ) ) return;

				var script = boiler.script;

				var asJson = JSON.stringify( script );
				if( asJson == _lastData ) return
				_lastData = asJson;

				Chart.setTemp0( script.steps[ 0 ].heat );
				Chart.setTemp1( script.steps[ 1 ].heat );
				Chart.setTemp2( script.steps[ 2 ].heat );
				Chart.setTemp3( script.steps[ 3 ].heat );
				Chart.setTemp4( script.steps[ 4 ].heat );

				Chart.setTime1( script.steps[ 1 ].hold );
				Chart.setTime2( script.steps[ 2 ].hold );
				Chart.setTime3( script.steps[ 3 ].hold );

				if( 'current' in script ) {
					
					var current = script.current,
						elapsed = current.elapsed,
						remaining = current.remaining,
						total = elapsed + remaining,
						percent = total != 0 ? elapsed / total : 0
						;
					percent = ((percent*360)<<0)/360;
					//Chart.setTimeBar( script.current.index /6 + percent /6 ); 
					Chart.setTimeBar( current.index, percent ); 
					Chart.setTimeStatus( remaining );
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

})($,BAG.Function);
