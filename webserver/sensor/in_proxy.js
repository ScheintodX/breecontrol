import { Mqtt } from '../helpers.js';
import _ from 'underscore';

export default function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		_time: undefined,

		status: undefined,
		override: undefined,

		setByWeb: function( topic, val ) {
			if( topic == 'override' ) self.override = val;
		},
		setByMqtt: function( topic, data ) {
			if( topic == 'status' ) {
				self.status = Mqtt.fromString( data, self._conf.type );
				self._time = new Date();
			}
		},
		subscribe: function( emit ) {
			emit( 'status' );
		}

	}, defaults );

	return self;
};
