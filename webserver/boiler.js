"use strict";

var _ = require( 'underscore' );
var Dot = require( 'dot-object' ),
	dash = new Dot( '/' );
var E = require( './E.js' ),
	Assert = require( './assert.js' );
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
				_conf: {
					type: 'f',
					timeout: 5000
				},
				status: 0,
				nominal: 0,
				max: 300,
				set: 0
			},
			heater: {
				_conf: {
					type: 'b',
					timeout: 5000
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
				_conf: {
					type: 'f',
					timeout: 5000
				},
				status: 0,
				nominal: 0,
				max: 300,
				set: 0
			},
			heater: {
				_conf: {
					type: 'b',
					timeout: 5000
				},
				status: false
			}
		},

		temp: {
			_conf: {
				type: 'f',
				mine: true,
				timeout: 5000
			},
			status: 0,
			nominal: 0,
			max: 100
		},

		aggitator: {
			_conf: {
				type: 'b',
				timeout: 1000
			},
			status: false,
			nominal: false,
			set: 0
		},

		fill: {
			_conf: {
				type: 'f',
				timeout: 2000
			},
			status: 0,
			override: null,
		},

		lid: {
			_conf: {
				type: 'b',
				timeout: 1000
			},
			status: false,
			override: null,
		},

		spare: {
			_conf: {
				type: 'b',
				timeout: 1000
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

		/*
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
		*/

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

				var tType = topic.replace( /\/[^\/]+$/, '/_conf/type' ),
					type = H.message.getByMqtt( self, tType );

				emit( boilerN + '/' + topic, H.mqtt.toString( val, type, 1 ) );
				
			} );
			
		},

		subscriptions: [
			'temp/set',
			'temp/status',
			'upper/temp/status',
			'upper/temp/nominal',
			'upper/heater/status',
			'lower/temp/status',
			'lower/temp/nominal',
			'lower/heater/status',
			'aggitator/nominal',
			'aggitator/status',
			'spare/nominal',
			'spare/status',
			'lid/status',
			'fill/status'
		],

		_watchTime: [
			'temp', 'upper.temp', 'lower.temp', 'lid', 'spare'
		],

		watch: function() {

			self.warn = {
				level: 'warn',
				messages: []
			};
			function _warn( level, val ) {
				self.warn.messages.push( { level: level, text: val } );
			}
			function warn( val ){
				_warn( 'warn', val );
			}
			function severe( val ){
				self.warn.level = 'severe';
				_warn( 'severe', val );
			}

			// ============ Check for Timeouts =============
			// If there are messages missing set the corresponging
			// values to undefined. Send warnings.

			var now = new Date();

			for( var i=0; i<self._watchTime.length; i++ ) {

				var name = self._watchTime[ i ];
				var w = H.message.getByDot( self, name );
				//var w = self._watchTime[ i ];

				var age = now - w._time;

				if( ! w._time || age > w._conf.timeout ) {
					w.status = undefined;
					if( ! w._conf.mine ) w.nominal = undefined;
				}
			}

			
			// ============ Control Temperature ============
			// Monitor the boiler temperature and regulate
			// the jacket heaters accordingly
			
			function optiTemp( jacket ) {

				var max = jacket.temp.max,
				    actual = self.temp.status,
				    nominal = self.temp.nominal,
					overheat = jacket._conf.overheat,
					boost = jacket._conf.boost
					;

				// Fallback in case we can't measure temperature
				if( typeof actual == 'undefined' )
						return nominal + overheat;

				// Do something for "boiling mode"
				// if( nominal == 100 )
						

				var opti = nominal
						+ overheat
						+ (nominal - actual) * boost
						;

				return Math.min( opti, max );
			}

			if( 'set' in self.temp ) {
				self.temp.nominal = self.temp.set;
				delete( self.temp.set );
			}

			if( self.temp.status >= self.temp.nominal ) {

				self.upper.temp.set = 0;
				self.lower.temp.set = 0;
			} else {
				self.upper.temp.set = optiTemp( self.upper );
				self.lower.temp.set = optiTemp( self.lower );
			}


			// ============ Security section ===============
			// Check for things which shouldn't happen and
			// correct the values. Send warnings.
			
			if( self.lower.temp.set && self.fill.status < .3 ) {
				warn( "Water too low for lower heater" );
				if( self.fill.override >= .3 ) {
					severe( "OVERRIDE" );
				} else {
					self.lower.temp.set = 0;
				}
			}
			if( self.upper.temp.set && self.fill.status < .6 ) {
				warn( "Water too low for upper heater" );
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

			if( typeof self.upper.temp.status == "undefined" ) {
				severe( "Unknown upper temp" )
				self.upper.temp.set = 0;
			}
			if( typeof self.lower.temp.status == "undefined" ) {
				severe( "Unknown lower temp" )
				self.lower.temp.set = 0;
			}
			if( typeof self.temp.status == 'undefined' ) {
				severe( "Unknown temp" )
				self.upper.temp.set = 0;
				self.lower.temp.set = 0;
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

	Assert.present( "config", config );
	Assert.present( "state", state );

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
