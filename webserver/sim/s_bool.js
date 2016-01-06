"use strict";

var HQ = require( '../helpers.js' ).mqtt;

module.exports = function( conf ) {

	var self = {

		conf: conf,

		status: false,

		_genStatus: function( oldStatus ) {

			if( Math.random() < conf.freq ) return oldStatus
			else return !oldStatus;
		},

		run: function( emit ) {

			if( conf.mode == 'random' ) {
				self.status = self._genStatus( self.status );
			}

			emit( conf.topic + '/status', '' + HQ.toString( self.status, 'b' ) );
		}
	}
	return self;
};
