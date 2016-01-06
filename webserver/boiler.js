"use strict";

var _ = require( 'underscore' );
var Dot = require( 'dot-object' ),
	dash = new Dot( '/' );
var E = require( './E.js' );
var H = require( './helpers.js' );
var log = require( './logging.js' );

function createBoiler( index, config ) {

	var JACKET_MAX = 300;

	var Boiler = {

		name: config.name,
		index: index,

		upper: {
			temp: {
				_meta: {
					type: 'f'
				},
				status: 0,
				nominal: 0,
				max: 300,
				set: 0
			},
			heater: {
				_meta: {
					type: 'b'
				},
				status: false
			}
		},

		lower: {
			temp: {
				_meta: {
					type: 'f'
				},
				status: 0,
				nominal: 0,
				max: 300,
				set: 0
			},
			heater: {
				_meta: {
					type: 'b'
				},
				status: false
			}
		},

		temp: {
			_meta: {
				type: 'f'
			},
			status: 0,
			nominal: 0,
			max: 100
		},
		aggitator: {
			_meta: {
				type: 'b'
			},
			status: false,
			nominal: false,
			set: 0
		},

		fill: {
			_meta: {
				type: 'f'
			},
			status: 0,
			override: null,
		},
		lid: {
			_meta: {
				type: 'b'
			},
			status: false,
			override: null,
		},
		spare: {
			_meta: {
				type: 'b'
			},
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

		publishable: [
			"upper/temp/set",
			//"upper/temp/max",
			"lower/temp/set",
			//"lower/temp/max",
			//"temp/nominal",
			"aggitator/set"
			//"lid/override",
			//"fill/override"
		],

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

			_.each( Boiler.publishable, function( topic ) {

				var val = H.message.getByMqtt( Boiler, topic );

				if( typeof val == 'undefined' ) return;

				var tType = topic.replace( /\/[^\/]+$/, '/_meta/type' ),
					type = H.message.getByMqtt( Boiler, tType );

				emit( boilerN + '/' + topic, H.mqtt.toString( val, type, 1 ) );
				
			} );

			
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

			if( Boiler.temp.set ) {
				Boiler.temp.nominal = Boiler.temp.set;
				delete( Boiler.temp.set );
			}

			if( Boiler.temp.status >= Boiler.temp.nominal ) {

				Boiler.upper.temp.set = 0;
				Boiler.lower.temp.set = 0;
			} else {
				Boiler.upper.temp.set = Boiler.upper.temp.max;
				Boiler.lower.temp.set = Boiler.lower.temp.max;
			}

			// ============ Security section ===============
			if( Boiler.lower.temp.set && Boiler.fill.status < .3 ) {
				warn( "Water to low for lower heater" );
				if( Boiler.fill.override >= .3 ) {
					severe( "OVERRIDE" );
				} else {
					Boiler.lower.temp.set = 0;
				}
			}
			if( Boiler.upper.temp.set && Boiler.fill.status < .6 ) {
				warn( "Water to low for upper heater" );
				if( Boiler.fill.override >= .6 ) {
					severe( "OVERRIDE" );
				} else {
					Boiler.upper.temp.set = 0;
				}
			}

			if( ( Boiler.upper.temp.set || Boiler.lower.temp.set ) && ! Boiler.lid.status ) {
				warn( "Lid open: cant measure temp" );
				if( Boiler.lid.override ) {
					severe( "OVERRIDE" )
				} else {
					Boiler.upper.temp.set = 0;
					Boiler.lower.temp.set = 0;
				}
			}

			if( !( Boiler.lid.status ) && Boiler.aggitator.status ) {
				warn( "Aggitator on with Lid open" );
				if( Boiler.lid.override ) {
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
