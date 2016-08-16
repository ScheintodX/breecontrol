"use strict";

var HQ = require( '../helpers.js' ).mqtt;
var E = require( '../E.js' );

var SFloat = require( './s_float.js' );
var _ = require( 'underscore' );

module.exports = function( conf ) {

	var parent = SFloat( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				if( Sensors.pump.status ) {

					self.status -= .5;

					if( self.status < Sensors.pump.conf.off )
							self.status = Sensors.pump.conf.off;

				} else {

					self.status += .1;

					if( self.status > Sensors.pump.conf.on )
							self.status = Sensors.pump.conf.on;
				}
			}

			parentRun( emit, Sensors );

		}

	} );

	return self;
};
