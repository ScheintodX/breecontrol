"use strict";

var _ = require( 'underscore' );
var Dot = require( 'dot-object' ),
	dash = new Dot( '/' );
var E = require( './E.js' );
var H = require( './helpers.js' );
var log = require( './logging.js' );

function createBoiler( index, config ) {

	var JACKET_MAX = 300;

	var self = {

		name: config.name,
		index: index,
		conf: config,

		upper: {
			_conf: {
				overheat: 20,
				boost: 15
			},
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
			_conf: {
				overheat: 50,
				boost: 50
			},
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
			set: 0/*,
			_run {
				requireRelease: false
			}
			*/
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
		indicator: {
			color: {

			},
			mode: {

			},
			_notify: function( what ){
				switch( what ) {
					case 'run':
						self.indicator.color.set = '0000ff0000aa000044000000'.repeat(3);
						self.indicator.mode.set = 'rotate';
						break;
					case 'ready':
						self.indicator.color.set = 'ffff00'.repeat(12);
						self.indicator.mode.set = 'fade';
						break;
					case 'done':
						self.indicator.color.set = '00ff00'.repeat(12);
						self.indicator.mode.set = 'show';
						break;
				}
			}
		},

		script: {

			name: 'Braumeister Böhmke',
			start: 1234567.89, //timestamp
			elapsed: 3323, //s
			remaining: 8352, //s

			steps: [
				{ heat: 70 },
				{ heat: 65, hold: 2700 },
				{ heat: 87, hold: 2700 },
				{ heat: 100, hold: 2700 },
				{ heat: 100 }
			],

			actions: [],

			current: {
				index: 3,
				mode: 'running', // one of: stopped, running, paused
				elapsed: 900,
				remaining: 1400
			}
		},

		_publishable: [
			"upper/temp/set",
			//"upper/temp/max",
			"lower/temp/set",
			//"lower/temp/max",
			//"temp/nominal",
			"aggitator/set"
			//"lid/override",
			//"fill/override"
		],

		publish: function( emit ) {

			var boilerN = 'boiler' + (self.index+1);

			_.each( self._publishable, function( topic ) {

				var val = H.message.getByMqtt( self, topic );

				if( typeof val == 'undefined' ) return;

				var tType = topic.replace( /\/[^\/]+$/, '/_meta/type' ),
					type = H.message.getByMqtt( self, tType );

				emit( boilerN + '/' + topic, H.mqtt.toString( val, type, 1 ) );
				
			} );

			
		},

		watch: function() {

			self.warn = {
				level: "warn",
				messages: []
			};

			function warn( val ){
				self.warn.messages.push( { level: 'warn', text: val } );
			}

			function severe( val ){
				self.warn.level = 'severe';
				self.warn.messages.push( { level: 'severe', text: val } );
			}

			if( self.temp.set ) {
				self.temp.nominal = self.temp.set;
				delete( self.temp.set );
			}

			function optiTemp( jacket ) {

				var max = jacket.temp.max,
				    actual = self.temp.status,
				    nominal = self.temp.nominal,
					overheat = jacket._conf.overheat,
					boost = jacket._conf.boost
					;

				var opti = nominal
						+ overheat
						+ (nominal - actual) * boost
						;

				return Math.min( opti, max );
			}

			if( self.temp.status >= self.temp.nominal ) {

				self.upper.temp.set = 0;
				self.lower.temp.set = 0;
			} else {
				self.upper.temp.set = optiTemp( self.upper );
				self.lower.temp.set = optiTemp( self.lower );
			}

			// ============ Security section ===============
			if( self.lower.temp.set && self.fill.status < .3 ) {
				warn( "Water to low for lower heater" );
				if( self.fill.override >= .3 ) {
					severe( "OVERRIDE" );
				} else {
					self.lower.temp.set = 0;
				}
			}
			if( self.upper.temp.set && self.fill.status < .6 ) {
				warn( "Water to low for upper heater" );
				if( self.fill.override >= .6 ) {
					severe( "OVERRIDE" );
				} else {
					self.upper.temp.set = 0;
				}
			}

			if( ( self.upper.temp.set || self.lower.temp.set ) && ! self.lid.status ) {
				warn( "Lid open: cant measure temp" );
				if( self.lid.override ) {
					severe( "OVERRIDE" )
				} else {
					self.upper.temp.set = 0;
					self.lower.temp.set = 0;
				}
			}

			if( !( self.lid.status ) && (self.aggitator.status || self.aggitator.set ) ) {
				warn( "Aggitator on with Lid open" );
				if( self.lid.override ) {
					severe( "OVERRIDE" );
				} else {
					self.aggitator.set = 0;
				}
			}
		}

	};

	return self;
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
