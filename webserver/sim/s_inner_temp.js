"use strict";

var E = require( '../E.js' );
var HQ = require( '../helpers.js' ).mqtt;

var SFloat = require( './s_float.js' );
var _ = require( 'underscore' );

module.exports = function( conf ) {

	var parent = SFloat( conf ),
		parentRun = parent.run
		;
	var r = conf.status.range;

	var self = _.extend( parent, {

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				var avgHeater = (Sensors.upper.temp.status + Sensors.lower.temp.status)/2;

				var diff = avgHeater - self.status;

				if( diff > 0 ) {
					self.status += .02*diff*conf.speed;
				} else {
					self.status += .01*diff*conf.speed;
				}

				if( self.status > 100 ) self.status = 100;

				self.status = self.status.jitter( conf.jitter );
			}

			parentRun( emit );
		}

	} );

	return self;
}
