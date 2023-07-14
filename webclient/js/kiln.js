"use strict";

/**
 * Operate one Kiln
 *
 * Multiple instances. Create with
 * <pre>
 *   var b = BAG.Kiln( id );
 * </pre>
 */
BAG.Kiln = (function($,Ψ){

	const MAX_POWER = 18000;

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

		var Kiln = {

			setTempInnerStatus: ψ.asDegree( ψ.text( 'temp_inner_status' ), true ),
			setTempInnerNominal: ψ.asDegree( ψ.text( 'temp_inner_nominal' ) ),
			setTimeRemaining: ψ.asHourMinSec( ψ.text( 'time_remaining' ) ),
			setTimeElapsed: ψ.asHourMinSec( ψ.text( 'time_elapsed' ) ),
			setHeaterPowerStatus: ψ.asUnit( ψ.text( 'heater_power_status' ), "kW", 3 ),
			setExtramassStatus: ψ.asUnit( ψ.text( 'extramass_status' ), "kg", 3 ),
			//setHeaterPowerStatusAbs: ψ.asUnit( ψ.text( 'heater_power_status_abs' ), "kW", 3 ),
			setHeaterPowerIcon: ψ.asPowerColor( ψ.fill( 'temp_heater_icon' ), 1 ),
			setDoor: ψ.visible( 'lid' ),
			setDoorOverride: ψ.override( ψ.visible( 'lid_override' ) ),
			setMode: ψ.oneOf( 'mode_', [ 'run', 'pause', 'stop' ] ),

			gotData: function( data ) {

				if( !_svg ) return;

				if( !( 'devices' in data ) ) return;

				var kiln = data.devices[ device ];

				console.log( kiln );

				if( 'door' in kiln ) {
					Kiln.setDoor( kiln.door.status );
					Kiln.setDoorOverride( kiln.door.override );
				}

				if( 'temp' in kiln ) {
					Kiln.setTempInnerStatus( kiln.temp.status );
					Kiln.setTempInnerNominal( kiln.temp.nominal );
				}

				if( 'powerfactor' in kiln ) {
					Kiln.setHeaterPowerStatus( kiln.powerabs.status );
					//Kiln.setHeaterPowerStatusAbs( kiln.power.status / 10000 );
					Kiln.setHeaterPowerIcon( kiln.powerfactor.status );
				}

				if( 'extramass' in kiln ) {
					Kiln.setExtramassStatus( kiln.extramass.status );
				}

				if( 'script' in kiln ) {
					var script = kiln.script;
					Kiln.setTimeRemaining( script.remaining );
					Kiln.setTimeElapsed( script.current.remaining );
					Kiln.setMode( script.mode );
				} else {
					Kiln.setTimeRemaining( undefined );
					Kiln.setTimeElapsed( undefined );
					Kiln.setMode( 'unknown' );
				}

			},

			ready: function() {
				return _svg !== false;
			}
		};

		$elem.on( 'load', function() {

			_svg = $elem.get( 0 ).contentDocument;

			// Animate stuff
			/*
			$svg('fill_content_anim')
					.expectOne()
					.velocity( { translateY: [0, 5] }, { duration: 2000, loop: true } )
					;
			$svg('beer')
					.expectOne()
					.velocity( { fill: ['#f4da00','#f4d000'] }, { duration: 375, loop: true } )
					;
					*/

		} );

		return Kiln;
	};

})($, BAG.Function);
