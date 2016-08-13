"use strict";

var HQ = require( '../helpers.js' ).mqtt;
var E = require( '../E.js' );

var ABool = require( './a_bool.js' );
var _ = require( 'underscore' );

module.exports = function( conf ) {

	var parent = ABool( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				var mode = Sensors.mode.status;

				if( mode == "on" ) {

					self.status = true;

				} else if( mode == "off" ) {

					self.status = false;

				} else if( mode == "auto" ) {

					var hum_in = Sensors.indoor.humidity_abs.status,
						hum_out = Sensors.outdoor.humidity_abs.status,
						offset = conf.offset
						;

					if( hum_i > hum_out + offset ) {

						self.status = true;

					} else if( hum_i < hum_out + offset - hysteresis ) {

						self.status = false;
					}

				} else {

					E.rr( "Unknown mode: " + mode );
				}

			} else {
				parentRun( emit, Sensors );
			}

		}
	} );

	return self;
};
