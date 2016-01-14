"use strict";

var E = require( '../E.js' );
var MQTT = require( '../helpers.js' ).mqtt;
var _ = require( 'underscore' );

module.exports = function( conf, defaults ) {

	defaults = defaults || {};

	function optiTemp( jacket ) {

		var max = jacket.temp.max,
			actual = self.status,
			nominal = self.nominal,
			overheat = jacket._conf.overheat,
			boost = jacket._conf.boost
			;

		// Fallback in case we can't measure temperature
		if( typeof actual == 'undefined' )
				return nominal + overheat;

		// Do something for "boiling mode"
		// if( nominal == 100 )
				

		var opti = nominal
				+ overheat
				+ (nominal - actual) * boost
				;

		return Math.min( opti, max );
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
				self.status = MQTT.fromString( data, self._conf.type );
				self._time = new Date();
			}
		},
		subscribe: function( emit ) {
			emit( 'status' );
		},
		run: function( boiler, warn ) {

			if( self.status >= self.nominal ) {

				boiler.upper.temp.setTo( 0 );
				boiler.lower.temp.setTo( 0 );
			} else {
				boiler.upper.temp.setTo( optiTemp( boiler.upper ) );
				boiler.lower.temp.setTo( optiTemp( boiler.lower ) );
			}
		}

	}, defaults );

	return self;
};
