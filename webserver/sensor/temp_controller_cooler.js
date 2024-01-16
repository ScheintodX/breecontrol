import { Mqtt } from '#helpers';
import _ from 'underscore';

export default function( conf, defaults ) {

	defaults = defaults || {};

	function optiTemp( jacket ) {

		var min = jacket.temp.min,
			actual = self.status,
			nominal = self.nominal,
			overheat = jacket._conf.overheat,
			boost = jacket._conf.boost
			;

		// If no temp set send 0 to heater
		if( typeof nominal == 'undefined' )
				return 0;

		// Fallback in case we can't measure temperature
		if( typeof actual == 'undefined' )
				return nominal + overheat;

		// Do something for "boiling mode"
		// if( nominal == 100 )

		var opti = nominal
				- overheat
				+ (nominal - actual) * boost
				;

		return Math.max( opti, min );
	}

	var self = _.defaults( {

		_conf: conf,

		status: undefined,
		nominal: undefined,

		_time: undefined,

		setTo: function( val ) {
			self.nominal = val;
		},

		setByWeb: function( topic, val ) {
			if( topic == 'set' ) self.nominal = val;
		},
		setByMqtt: function( topic, data ) {
			if( topic == 'status' ) {
				self.status = Mqtt.fromString( data, self._conf.type );
				self._time = new Date();
			}
		},

		subscribe: function( emit ) {
			emit( 'status' );
		},

		run: function( device, warn ) {

			if( self.status <= self.nominal ) {

				device.jacket.temp.setTo( self.nominal );
			} else {
				device.jacket.temp.setTo( optiTemp( device.jacket ) );
			}
		}

	}, defaults );

	return self;
};
