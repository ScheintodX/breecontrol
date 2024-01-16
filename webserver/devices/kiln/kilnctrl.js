import Assert from '../../assert.js';

export default function( CONFIG ) {

	const HR =
		// s. https://www.kanthal.de/produkte-und-dienstleistungen/material-
		// datasheets/wire/resistance-heating-wire-and-resistance-wire/kanthal-a-1
		T=>((x)=>1+[0,0,0,0,1,2,2,3,3,4,4,4,4,5][x<0?0:x>14?14:x]*.01)(T/100|0);

	function check( script ){
		Assert.isObject( "script", script );
		Assert.isArray( "script.steps", script.steps );

		script.steps.forEach( (e,i) => {

			Assert.present( `step{i}`, e );
			Assert.present( `step{i}.name`, e.name );
			Assert.present( `step{i}.rate`, e.rate );
			Assert.present( `step{i}.heat`, e.heat );
		} );
	}

	function prepare( script ){

		script.end = -1;
		script.step = -1;

		var found = false;
		var steps = script.steps
		script.split = -1;

		for( var i=0; i<steps.length; i++ ){
			var step = steps[i];
			if( step.rate < 0 ){
				script.split = i;
				break;
			}
		}

		if( script.split < 0 ) {
			throw new Error( "No Split found" );
		}
	}

	// Calculate the rate depending on the Temperature
	// script: Script to use
	// heating: true: heating, false: cooling
	// T: current temperature
	function stepFor( script, heating, t, T ){

		var i, step;

		var start = heating ? 0 : script.split,
		    end =   heating ? script.split : script.steps.length;

		for( i=start; i<end; i++ ){
			step = script.steps[ i ];

			if( script.step == i ){
				if( script.heat <= T ){
					if( !script.end ){
						script.end = t;
					}
					if( script.end < t+step.hold ){
						return step;
					}
				}
			}

			if( heating ? step.heat > T : step.heat < T ) {
				script.step = i;
				script.end = 0;
				return step;
			}
		}
	}

	function power2fac( kW, T ){

		var p_max = CONFIG.P_MAX / HR( T );

		return kW / p_max;
	}

	function powerFor( rate, T ){

		var p_heat = CONFIG.Q_KILN * rate,
			p_loss = CONFIG.P_LOSS * T,
		    res = p_heat + p_loss;

		return res > 0 ? res : 0;
	}

	var Script;

	return {

		load: function( script ) {
			check( script ); // throws Errors by its own
			prepare( script );
			Script = script;
		},

		start: function() {

		},

		_check: check,
		_prepare: prepare,
		_stepFor: stepFor,
		_powerFor: powerFor,
		_power2fac: power2fac
	}
}
