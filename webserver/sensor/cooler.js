"use strict";

var E = require( '../E.js' );
var MQTT = require( '../helpers.js' ).mqtt;
var _ = require( 'underscore' );

var InOut = require( './inout_proxy.js' );

module.exports = function( conf, defaults ) {

	var self = InOut( conf, defaults );

	self.watch = function( boiler, warn ) {

		if( typeof self.status == "undefined" ) {
			warn.severe( "Unknown coller temp" )
			self.setTo( 0 );
		}
	}

	return self;
}
