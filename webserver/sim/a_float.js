"use strict";

var E = require( '../E.js' );
var HQ = require( '../helpers.js' ).mqtt;

var SFloat = require( './s_float.js' );
var _ = require( 'underscore' );

module.exports = function( conf ) {

	var r = conf.nominal.range;

	var parent = SFloat( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		nominal: conf.nominal.initial,

		run: function( emit ) {

			if( conf.mode == 'random' ) {
				self.nominal = self._genStatus( self.nominal );
			}

			if( conf.mode == 'simulate' && self.nominal > 0 ) {
				if( !self._last || new Date() - self._last > conf.timeout ) {
					E.rr( "power off " + conf.topic + " due to missing messages" );
					self.nominal = false;
				}
			}

			emit( conf.topic + '/nominal', HQ.toString( self.nominal, 'f', 1 ) );
			
			parentRun( emit );

			// Some delay from nominal to status
			if( conf.mode == 'simple' ) {
				if( self.status != self.nominal ) {
					self.status = self.nominal;
				}
			}
		},

		msg: function( emig, topic, data ) {

			if( topic.match( /\/set$/ ) ){

				self._last = new Date();

				if( self.check( topic, data, r ) ) {
					self.nominal = HQ.fromString( data, 'f' );
				}
			}
		},

		check: function( topic, val, range ) {

			if( val == "" ) return true;

			var parsed = HQ.fromString( val, 'f' );

			if( isNaN( parsed ) ){
				E.rr( "Not a number: " + val + " in " + topic );
				return false;
			}

			if( parsed < range[0] || parsed > range[1] ) {
				E.rr( "Not in range: " + parsed + " " + range + " in " + topic );
				return false;
			}
			return true;
		}
	} );

	return self;

};
