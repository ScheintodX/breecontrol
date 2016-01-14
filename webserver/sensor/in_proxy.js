"use strict";

var E = require( '../E.js' );
var MQTT = require( '../helpers.js' ).mqtt;
var _ = require( 'underscore' );

module.exports = function( conf, defaults ) {

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
				self.status = MQTT.fromString( data, self._conf.type );
				self._time = new Date();
			}
		},
		subscribe: function( emit ) {
			emit( 'status' );
		}

	}, defaults );

	return self;
};
