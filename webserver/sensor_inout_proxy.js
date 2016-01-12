"use strict";

var E = require( './E.js' );
var MQTT = require( './helpers.js' ).mqtt;
var _ = require( 'underscore' );

module.exports = function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		status: undefined,
		nominal: undefined,

		set: undefined,

		setTo: function( val ) {
			self.set = val;
		},

		setByWeb: function( topic, val ) {
			if( topic != 'status' && topic != 'nominal' && topic in self ) {
				self[ topic ] = val;
			}
		},
		setByMqtt: function( topic, data ) {

			if( topic == 'status' || topic == 'nominal' ) {

				if( topic == 'status' ) {
					self.status = MQTT.fromString( data, self._conf.type );
				} else if( topic == 'nominal' ) {
					self.nominal = MQTT.fromString( data, self._conf.type );
				}
				self._time = new Date();
			}
		},
		subscribe: function( emit ) {
			emit( 'status' );
			emit( 'nominal' );
		},
		publish: function( emit ) {
			if( typeof self.set != 'undefined' )
					emit( 'set', MQTT.toString( self.set, self._conf.type, 1 ) );
		}

	}, defaults );

	return self;
};
