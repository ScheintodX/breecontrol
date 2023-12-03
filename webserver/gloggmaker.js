import { _ } from 'underscore';

import { Message as HM } from './helpers.js';

import InProxy from './sensor/in_proxy.js';
import OutProxy from './sensor/out_proxy.js';
import InOutProxy from './sensor/inout_proxy.js';
import TempController from './sensor/temp_controller.js';
import Combined from './sensor/combined.js';
import Heater from './sensor/heater.js';
import Aggitator from './sensor/aggitator.js';
;

export default function createGloggmaker( config, index ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		lower: Combined( {
				overheat: 50,
				boost: 50
			}, {
				temp: Heater( {
						name: 'Lower Heater',
						type: 'f',
						timeout: 5000,
						minfill: .3
					}, {
						status: 0,
						nominal: 0,
						max: 300,
						set: 0
				} ),
				heater: InProxy( {
						type: 'b',
						timeout: 5000
				} )
		} ),

		temp: TempController( {
				type: 'f',
				mine: true,
				timeout: 5000
			}, { set: 0 } ),

		aggitator: Aggitator( {
				type: 'b',
				timeout: 1000
			}, { set: 0 } ),

		fill: InProxy( {
				type: 'f',
				timeout: 2000 } ),

		lid: InProxy( {
				type: 'b',
				timeout: 1000 } ),

		spare: InOutProxy( {
				type: 'b',
				timeout: 1000
			}, { set: 0 } ),

		indicator: {
			color: OutProxy( { type: 's' } ),
			mode: OutProxy( { type: 's' } ),

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

	} ), {

		_watchTime: [
			'temp', 'lower.temp', 'lid', 'spare'
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
				var w = HM.getByDot( self, name );
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
			
			self.lower.temp.watch( self, self.warn );

			self.aggitator.watch( self, self.warn );
		},

		power: function() {

			var result = 0;

			if( self.lower.heater.status ) result += self.conf.power;

			return result;
		},

		powerLimit: function( limit ) {

			if( limit < self.conf.power ) self.lower.temp.set = 0;
		}

	} );

	return self;
};
