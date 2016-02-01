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

				var avgHeaters = 0,
					numHeaters = 0;
				if( Sensors.upper ){
					avgHeaters += Sensors.upper.temp.status;
					numHeaters++;
				}
				if( Sensors.lower ){
					avgHeaters += Sensors.lower.temp.status;
					numHeaters++;
				}
				avgHeaters /= numHeaters;

				var diff = avgHeaters - self.status;

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
