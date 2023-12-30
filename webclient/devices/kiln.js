import Ψ from '../js/functions.js';

/**
 * Operate one Kiln
 *
 * Multiple instances. Create with
 * <pre>
 *   var b = BAG.Kiln( id );
 * </pre>
 */
const MAX_POWER = 18000;

// Constructor function
export default function( elem, device, passive ) {

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
		setExtramassStatus: ψ.asUnit( ψ.text( 'extramass_status' ), "kg", 3 ),
		setDamper: ψ.oneOf( 'damper_', [ '0', '1', '2', '3', '4' ] ),
		setHeaterPowerStatus: ψ.asUnit( ψ.text( 'heater_power_status' ), "%", -2 ),
		setHeaterPowerBar: ψ.asPowerColor( ψ.fill( 'temp_heater_icon' ), 1 ),
		setHeaterPowerIcon: ψ.visible( 'icon_heating' ),
		/*
		setDoor: ψ.visible( 'lid' ),
		setDoorOverride: ψ.override( ψ.visible( 'lid_override' ) ),
		*/
		setMode: ψ.oneOf( 'mode_', [ 'run', 'pause', 'stop' ] ),

		setSystem: ψ.visible( 'system_icon' ),

		gotData: function( data ) {

			if( !_svg ) return;

			if( !( 'devices' in data ) ) return;

			var kiln = data.devices[ device ];

			if( 'system' in kiln ) {
				Kiln.setSystem( kiln.system.status );
			}

			/*
			if( 'door' in kiln ) {
				Kiln.setDoor( kiln.door.status );
				Kiln.setDoorOverride( kiln.door.override );
			}*/

			if( 'temp' in kiln ) {
				Kiln.setTempInnerStatus( kiln.temp.status );
				//Kiln.setTempInnerNominal( kiln.temp.nominal );
			}

			if( 'powerfactor' in kiln ) {
				//Note: If this seems to not work perhaps the simulator/ktrl is missing...
				Kiln.setHeaterPowerStatus( kiln.powerfactor.status );
			}

			if( 'heater' in kiln ) {
				Kiln.setHeaterPowerBar( kiln.heater.status );
				Kiln.setHeaterPowerIcon( kiln.heater.status );
			}

			if( 'extramass' in kiln ) {
				Kiln.setExtramassStatus( kiln.extramass.set );
			}

			if( 'damper' in kiln ) {
				Kiln.setDamper( kiln.damper.set );
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

	} );

	return Kiln;
};
