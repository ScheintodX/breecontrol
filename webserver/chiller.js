"use strict";

require( './polyfill.js' );

var _ = require( 'underscore' );

var Dot = require( 'dot-object' ),
	dash = new Dot( '/' );

var E = require( './E.js' ),
	Assert = require( './assert.js' );

var H = require( './helpers.js' );

var log = require( './logging.js' );

var InProxy = require( './sensor/in_proxy.js' ),
	OutProxy = require( './sensor/out_proxy.js' ),
	InOutProxy = require( './sensor/inout_proxy.js' ),
	TempControllerCooler = require( './sensor/temp_controller_cooler.js' ),
	Combined = require( './sensor/combined.js' ),
	Cooler = require( './sensor/cooler.js' ),
	Aggitator = require( './sensor/aggitator.js' )
	;

function createBoiler( index, config ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		jacket: Combined( {
				overheat: 1,
				boost: 10
			}, {
				temp: Cooler( {
						name: 'Cooler',
						type: 'f',
						timeout: 5000,
					}, {
						status: 0,
						nominal: 0,
						max: 100,
						set: 0
				} ),
				cooler: InProxy( {
						type: 'b',
						timeout: 5000
				} )
		} ),

		temp: TempControllerCooler( {
				type: 'f',
				mine: true,
				timeout: 5000
			}, { set: 0 } ),

	} ), {

		_watchTime: [
			'temp', 'jacket.temp'
		],

		watch: function() {

			self.warn = {
				level: 'warn',
				messages: [],
				_warn: function( level, val ){
					self.warn.messages.push( { level: level, text: val } );
				},
				warn: function( val ){
					self.warn._warn( 'warn', val );
				},
				severe: function( val ){
					self.warn.level = 'severe';
					self.warn._warn( 'severe', val );
				}
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
			
			self.temp.run( self, self.warn );


			// ============ Security section ===============
			// Check for things which shouldn't happen and
			// correct the values. Send warnings.
			
			self.jacket.temp.watch( self, self.warn );
		}

	} );

	return self;
};

module.exports = {};

module.exports.create = createBoiler;
