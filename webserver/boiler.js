"use strict";

function createBoiler( index, config ) {

	var Boiler = {

		name: config.name,
		index: index,

		jacket: {

			upper: {
				temp: {
					status: 0,
					nominal: 0
				},
				power: {
					status: 0
				},
				heater: {
					status: 0
				}
			},
			lower: {
				temp: {
					status: 0,
					nominal: 0
				},
				power: {
					status: 0
				},
				heater: {
					status: 0
				}
			}

		},

		temp: {
			status: 0,
			nominal: 0
		},

		fill: {
			status: 0
		},
		aggitator: {
			status: 0
		},
		lid: {
			status: 0
		},
		spare: {
			status: 0
		},

		script: {

			name: 'Grießer Böckchen',
			start: 1234567.89, //timestamp
			elapsed: 3323, //s
			remaining: 8352, //s
			mode: 'heating', // heating | cooling

			steps: [
				{ action: 'heat', temp: 65.0 },
				{ action: 'hold', time: 2700 },
				{ action: 'heat', temp: 87.0 },
				{ action: 'hold', time: 2700 },
				{ action: 'heat', temp: 100 },
				{ action: 'hold', time: 2700 }
			],

			current: {
				index: 3,
				mode: 'running', // one of: stopped, running, paused
				elapsed: 900,
				remaining: 1400
			}
		},

		updateState: function( newState ) {

			Boiler.script.state = newState;
		},

		loadScript: function( newScript ) {

			Boiler.script = newScript;
			Boiler.script.state = {
				mode: 'stopped',
				index: 0,
				elapsed: 0,
				remaining: 0
			}
		}
	};

	return Boiler;
};

module.exports.createAll = function( config, state, done ) {

	if( typeof config == 'undefined' ) throw( "Config missing" );
	if( typeof state == 'undefined' ) throw( "State missing" );

	var result = {};

	for( var i=0; i < config.length; i++ ) {

		if( state.length <= i ) {
			state.push( {
				mode: 'stopped',
				start: 0,
				index: 0,
				elapsed: 0
			} );
		}

		result[ 'boiler' + (i+1) ] = createBoiler( i, config[ i ], state[ i ] );
	}

	return done( null, result );
};
