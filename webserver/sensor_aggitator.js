"use strict";

var E = require( './E.js' );
var MQTT = require( './helpers.js' ).mqtt;
var _ = require( 'underscore' );

var InOut = require( './sensor_inout_proxy.js' );

module.exports = function( conf, defaults ) {

	var self = InOut( conf, defaults );

	self.watch = function( boiler, warn ) {

		if( ( self.status || self.set ) && !( boiler.lid.status ) ) {
			warn.warn( "Aggitator on with Lid open" );
			if( boiler.lid.override ) {
				warn.severe( "OVERRIDE" );
			} else {
				self.setTo( 0 );
			}
		}
	}

	return self;
};
