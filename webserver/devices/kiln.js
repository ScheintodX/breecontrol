import { Message as HM } from '../helpers.js';

import InProxy from '../sensor/in_proxy.js';
import OutProxy from '../sensor/out_proxy.js';
import InOutProxy from '../sensor/inout_proxy.js';
import Combined from '../sensor/combined.js';
import WebValue from '../sensor/web_value.js';

import { E } from '../E.js';

/**
 * +------------+   +--------------+
 * | (door>)    |   | >system      |
 * |            |   | >powerfactor |
 * |    TEMP>   |   |              |
 * |            |   +--------------+
 * +------------+
 * | heater>    |
 * +------------+
 */
export default function createKiln( config, index ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		debug: false,

		// Temperatur of the Kiln
		// Can be set to a wanted temperature
		temp: InProxy( {
				type: 'f',
				timeout: 10000 },
			{ set: 0 } ),

		// Temperatur of the Kiln
		// Can be set to a wanted temperature
		heater: InProxy( {
				type: 'b',
				timeout: 5000 } ),

		// Temperatur of the Kiln
		// Can be set to a wanted temperature
		system: InOutProxy( {
				type: 'b',
				timeout: 5000 } ),

		// Door status
		// Can only be read from mqtt
		/*
		door: InProxy( {
				type: 'b',
				timeout: 1000 } ), */

		// Power factor 0..1
		// Percentage the kiln is turned on
		powerfactor: InOutProxy( {
			type: 'f',
			scale: 2 } ),

		// Value set by the web
		extramass: WebValue( {
			type: 'f' }, { set: 40000 } )

	} ), {

		_watchTime: [
			'temp'//, 'door', 'test'
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

				if( ! w._time || (now - w._time) > w._conf.timeout ) {
					//E.rr( `{name}: TIMEOUT` );
					w.status = undefined;
					if( ! w._conf.mine ) w.nominal = undefined;
				}
			}


			// ============ Control Temperature ============
			// Monitor the kiln temperature and regulate
			// the jacket accordingly
			//

			//E.x( "Temp", self.temp.status, self.temp.override, self.temp._time );
			//E.x( "Door", self.door.status, self.door.override, self.door._time );

			//self.temp.run( self, self.warn );


			// ============ Security section ===============
			// Check for things which shouldn't happen and
			// correct the values. Send warnings.

			//self.heater.temp.watch( self, self.warn );
		},

		calculatePower: function() {

			var result = 0;

			result += self.powerfactor.status * self.conf.power;

			return result;
		},

		powerLimit: function( limit ) {

			if( limit < self.conf.power ) self.heater.powerfactor.set = 0;
		}

	} );

	return self;
};
