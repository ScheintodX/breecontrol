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
				if( Sensors.jacket ){
					avgHeaters += Sensors.jacket.temp.status;
					numHeaters++;
				}
				avgHeaters /= numHeaters;

				var diff = avgHeaters - self.status;

				var change;

				if( diff > 0 ) {
					change = .02*diff*conf.speed;
				} else {
					change = .01*diff*conf.speed;
				}
				self.status += change;

				if( self.status > 100 ) self.status = 100;
				if( self.status < 0 ) self.status = 0;

				var jitter = self.status.jitter( conf.jitter );

				self.status = self.status.jitter( conf.jitter );
			}

			parentRun( emit );
		}

	} );

	return self;
}
