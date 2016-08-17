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
		
		// If no temp set send 0 to heater
		if( typeof nominal == 'undefined' )
				return 0;

		// Fallback in case we can't measure temperature
		if( typeof actual == 'undefined' )
				return nominal + overheat;

		var boiling = 0;
		if( nominal >= 100 ) {
			boiling = nominal-100;
			nominal = 100;
		}

		// normal operation
		var opti = nominal
				+ overheat
				+ (nominal - actual) * boost
				;

		// boiling mode
		if( boiling ) {

			// verdunstungsenthalpie:
			// 0,63kWh / kg Wasser

			opti = Math.max( opti, 200+boiling*10 );
		}

		opti = Math.min( opti, max );

		return opti;
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
		run: function( device, warn ) {

			if( self.status >= self.nominal ) {

				if( device.upper) device.upper.temp.setTo( 0 );
				if( device.lower) device.lower.temp.setTo( 0 );
			} else {
				if( device.upper ) device.upper.temp.setTo( optiTemp( device.upper ) );
				if( device.lower ) device.lower.temp.setTo( optiTemp( device.lower ) );
			}
		}

	}, defaults );

	return self;
};
