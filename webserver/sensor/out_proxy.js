"use strict";

var E = require( '../E.js' );
var MQTT = require( '../helpers.js' ).mqtt;
var _ = require( 'underscore' );

module.exports = function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		set: undefined,

		setTo: function( val ) {
			self.set = val;
		},
		setByWeb: function( topic, val ) {
			if( topic == 'set' ) self.set = val;
		},
		publish: function( emit ) {
			if( typeof self.set != 'undefined' )
					emit( 'set', MQTT.toString( self.set, self._conf.type, 1 ) );
		}

	}, defaults );

	return self;
};
