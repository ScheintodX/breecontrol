"use strict";

var E = require( './E.js' );
var MQTT = require( './helpers.js' ).mqtt;
var _ = require( 'underscore' );

var InOut = require( './sensor_inout_proxy.js' );

module.exports = function( conf, defaults ) {

	var self = InOut( conf, defaults );

	self.watch = function( boiler, warn ) {

		if( self.set && boiler.fill.status < self._conf.minfill ) {
			warn.warn( "Water too low for " + self._conf.name );
			if( boiler.fill.override >= self._conf.minfill ) {
				warn.severe( "OVERRIDE" );
			} else {
				self.setTo( 0 );
			}
		}

		if( self.set && ! boiler.lid.status ) {
			warn.warn( "Lid open: cant measure temp" );
			if( boiler.lid.override ) {
				warn.severe( "OVERRIDE" )
			} else {
				self.setTo( 0 );
			}
		}

		if( typeof self.status == "undefined" ) {
			warn.severe( "Unknown upper temp" )
			self.setTo( 0 );
		}
	}

	return self;
}
