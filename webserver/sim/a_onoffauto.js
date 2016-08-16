"use strict";

var HQ = require( '../helpers.js' ).mqtt;
var E = require( '../E.js' );

var SOnOffAuto = require( './s_onoffauto.js' );
var _ = require( 'underscore' );

module.exports = function( conf ) {

	var parent = SOnOffAuto( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		run: function( emit ) {

			parentRun( emit );

		},

		msg: function( emit, topic, data ) {

			if( topic.match( /\/set$/ ) ){

				if( self.check( topic, data ) ){
					self.status = HQ.fromString( data, 's' );
					self.conf.mode = "simple"; // turn to simple mode if user tries to contoll it.
				}
			}
		},

		check: function( topic, val ) {

			if( ['on','off','auto'].indexOf( val ) < 0 ) {
				E.rr( "Wrong val: " + val + " in " + topic )
				return false;
			}
			return true;
		}

	} );

	return self;
};
