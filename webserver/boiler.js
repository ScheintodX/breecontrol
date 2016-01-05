"use strict";

var E = require( './E.js' );
var Dot = require( 'dot-object' ),
	dash = new Dot( '/' );

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
					status: 0,
					nominal: 0
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
		aggitator: {
			status: 0,
			nominal: 0
		},

		fill: {
			status: 0,
			override: null,
		},
		lid: {
			status: 0,
			override: null,
		},
		spare: {
			status: 0,
			nominal: 0
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

		loadScript: function( newScript ) {

			Boiler.script = newScript;
			Boiler.script.state = {
				mode: 'stopped',
				index: 0,
				elapsed: 0,
				remaining: 0
			}
		},

		publish: function( emit ) {

			var boilerN = 'boiler' + (Boiler.index+1);

			var topics = dash.dot( Boiler );

			for( var topic in topics ) {

				if( topic.match( '\/set$' ) ){

					var tNominal = topic.replace( /\/set$/, '/nominal' );

					var val = topics[ topic ],
						nominal = topics[ tNominal ]
						;

					if( val === nominal ) continue;

					switch( typeof val ){
						case 'number': val = ''+val; break;
						case 'boolean': val = val ? '1' : '0';
						case 'string': break;
						default: throw "Unsupported Type: " + (typeof val);
					}

					emit( boilerN + '/' + topic, '' + topics[ topic ] );
				}
			}

			
		},

		watch: function() {

			Boiler.warn = {
				level: "warn",
				messages: []
			};

			function warn( val ){
				Boiler.warn.messages.push( { level: 'warn', text: val } );
			}

			function severe( val ){
				Boiler.warn.level = 'severe';
				Boiler.warn.messages.push( { level: 'severe', text: val } );
			}

			if( Boiler.temp.status >= Boiler.temp.nominal ) {

				Boiler.jacket.lower.temp.set = 0;
				Boiler.jacket.upper.temp.set = 0;
			} else {
				Boiler.jacket.lower.temp.set = 300;
				Boiler.jacket.upper.temp.set = 300;
			}

			// ============ Security section ===============
			if( Boiler.jacket.lower.temp.set && Boiler.fill.status < .3 ) {
				warn( "Water to low for lower heater" );
				if( Boiler.fill.override >= .3 ) {
					severe( "OVERRIDE" );
				} else {
					Boiler.jacket.lower.temp.set = 0;
				}
			}
			if( Boiler.jacket.upper.temp.set && Boiler.fill.status < .6 ) {
				warn( "Water to low for upper heater" );
				if( Boiler.fill.override >= .6 ) {
					severe( "OVERRIDE" );
				} else {
					Boiler.jacket.upper.temp.set = 0;
				}
			}

			if( !( Boiler.lid.status ) && Boiler.aggitator.status ) {
				warn( "Aggitator on with Lid open" );
				if( Boiler.lid.override == 1 ) {
					severe( "OVERRIDE" );
				} else {
					Boiler.aggitator.status = 0;
				}
			}
		}

	};

	return Boiler;
};

module.exports = {};

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
