"use strict";

var HQ = require( '../helpers.js' ).mqtt;

module.exports = function( conf ) {

	var r = conf.status.range;

	var self = {

		conf: conf,

		status: conf.status.initial,

		_genStatus: function( oldStatus ) {
			var rnd = Math.random() * ( r[1]-r[0]) + r[0];
			return ( 4*oldStatus + rnd ) / 5;
		},

		run: function( emit ) {

			if( conf.mode == 'random' ) {
				self.status = self._genStatus( self.status );
			}

			if( ! conf.disabled ) emit( conf.topic + '/status', HQ.toString( self.status, 'f', 1 ) );
		}
	}
	return self;
};
