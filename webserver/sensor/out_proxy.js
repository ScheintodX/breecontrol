import E from '#E';
import { Mqtt } from '#helpers';
import _ from 'underscore';

/**
 * Stores a value set by web
 *
 * The value is published to mqtt via "set" topic
 *
 * The value is stored in the "set" member variable
 */
export default function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		set: undefined,

		setTo: function( val ) {
			self.set = val;
		},
		setByWeb: function( topic, val ) {
			if( topic == 'set' ){
				self.set = val;
			}
		},
		publish: function( emit ) {
			if( typeof self.set != 'undefined' )
					emit( 'set', Mqtt.toString( self.set, self._conf.type, 1 ) );
		}

	}, defaults );

	return self;
};
