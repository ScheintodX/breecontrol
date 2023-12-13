import { Mqtt } from '../helpers.js';
import _ from 'underscore';
import { E } from '../E.js';

export default function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		status: undefined,
		nominal: undefined,

		set: undefined,
		setTo: function( val ) {
			E.x( "setTo", val );
			self.set = val;
		},

		setByWeb: function( topic, val ) {

			E.x( "web", topic, val );
			if( topic != 'status' && topic != 'nominal' && topic in self ) {
				self[ topic ] = val;
			}
		},

		setByMqtt: function( topic, data ) {

			E.x( "web", topic, data );
			if( topic == 'status' || topic == 'nominal' ) {
				self[ topic ] = Mqtt.fromString( data, self._conf.type );
				self._time = new Date();
			}
		},

		subscribe: function( emit ) {
			emit( 'status' );
			emit( 'nominal' );
		},

		publish: function( emit ) {
			E.x( "publish: set", self.set )
			if( typeof self.set != 'undefined' )
					emit( 'set', Mqtt.toString( self.set, self._conf.type, 1 ) );
		},

		run: function( device, warn ) {

			E.x( "run" );
		}

	}, defaults );

	return self;
};
