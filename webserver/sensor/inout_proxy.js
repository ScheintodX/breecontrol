import { Mqtt } from '../helpers.js';
import _ from 'underscore';
import { E } from '../E.js';

/**
 * Stores three value:
 *   set: value
 *   status: current value of the device
 *   nominal: value we want to reach
 *
 * normal working:
 *   Q< device/status: 100
 *   web -> set: 200
 *   Q> device/set: 200
 *   Q< device/status: 200
 *   status: 200 -> web
 *
 * nominal has no intrinsic functionnality but can
 * be used by code to do what needs to be done.
 */
export default function( conf, initial ) {

	initial = initial || {};

	var self = _.defaults( {

		_conf: _.defaults( conf, {
			scale: 1
		} ),

		status: undefined,

		set: undefined,

		setTo: function( val ) {
			self.set = val;
		},

		setByWeb: function( topic, val ) {
			if( topic != 'status' && topic in self ) {
				self[ topic ] = val;
			}
		},
		setByMqtt: function( topic, data ) {
			if( topic == 'status' ) {
				self[ topic ] = Mqtt.fromString( data, self._conf.type );
				self._time = new Date();
			}
		},
		subscribe: function( emit ) {
			emit( 'status' );
		},
		publish: function( emit ) {
			if( typeof self.set != 'undefined' ) {
				var as = Mqtt.toString( self.set, self._conf.type, self._conf.scale );
				emit( 'set', as );
			}
		}

	}, initial );

	return self;
};
