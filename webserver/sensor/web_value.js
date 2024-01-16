import { Mqtt } from '../helpers.js';
import _ from 'underscore';
import E from '../E.js';

/**
 * One value set by the web client.
 * This is used for configuring controller parameters.
 * The values are published as "set" so we can log them
 * and use them in simulator.
 */
export default function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		set: undefined,

		setByWeb: function( topic, val ) {
			self.set = val;
		},

		publish: function( emit ) {

			if( typeof self.set != 'undefined' ) {
				var as = Mqtt.toString( self.set, self._conf.type, self._conf.scale );
				emit( 'set', as );
			}
		}

	}, defaults );

	return self;
};
