import { Message as HM } from '../helpers.js';

import InProxy from '../sensor/in_proxy.js';
import InOutProxy from '../sensor/inout_proxy.js';
import Combined from '../sensor/combined.js';

export default function createKiln( config, index ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		temp: InProxy( {
				type: 'f',
				timeout: 2500 } ),

		power: InOutProxy( {
				type: 'f',
				timeout: 2500 } ),

		door: InProxy( {
				type: 'b',
				timeout: 2500 } ),

		extramass: InProxy( {
				type: 'f',
				timeout: 2500 } )

	} ), {

		_watchTime: [
			'temp', 'door', 'power'
		],

		warn: {

			level: '',
			messages: [],
			_warn: function( level, val ){
				self.warn.messages.push( { level: level, text: val } );
			},
			clear: function() {
				self.warn.level = 'ok';
				self.warn.messages = [];
			},
			warn: function( val ){
				if( self.warn.level != 'severe' ) self.warn.level = 'warn';
				self.warn._warn( 'warn', val );
			},
			severe: function( val ){
				self.warn.level = 'severe';
				self.warn._warn( 'severe', val );
			}
		},

		watch: function() {

			self.warn.clear();

			// ============ Check for Timeouts =============
			// If there are messages missing set the corresponging
			// values to undefined. Send warnings.

			var now = new Date();

			for( var i=0; i<self._watchTime.length; i++ ) {

				var name = self._watchTime[ i ];
				var w = HM.getByDot( self, name );

				var age = now - w._time;

				if( ! w._time || age > w._conf.timeout ) {
					w.status = undefined;
					if( ! w._conf.mine ) w.nominal = undefined;
				}
			}

			
			// ============ Control Temperature ============
			// Monitor the kiln temperature and regulate
			// the jacket accordingly
			
			//self.temp.run( self, self.warn );


			// ============ Security section ===============
			// Check for things which shouldn't happen and
			// correct the values. Send warnings.
			
			//self.heater.temp.watch( self, self.warn );
		},

		calculatePower: function() {

			var result = 0;

			result += self.power.status;

			return result;
		},

		powerLimit: function( limit ) {

			if( limit < self.conf.power ) self.heater.temp.set = 0;
		}

	} );

	return self;
};
