"use strict";

var E = require( '../E.js' );

var SFloat = require( './s_float.js' )
	;

function calcAbsoluteHumidity( t, rh ) {

	var sat = 6.1078 * Math.pow( 10, ( 7.5 * t ) / ( 237.3 * t ) ); // Sättigungsdampfdruck
	var p = rh * sat; // act. Dampfdruck
	var ah = 10000.0 * ( 18.016 / 8314.3 ) * ( p / ( t + 273 ) ); // Abs humi

	return ah;
}

module.exports = function( conf ) {

	var self = {

		conf: conf,

		temp: SFloat( conf.temp ),
		humidity_rel: SFloat( conf.humidity_rel ),
		humidity_abs: SFloat( conf.humidity_abs ),

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				if( conf.where == 'indoor' ) {

					if( Sensors.fan.status ) {

						E.rr( self.temp.status
								, Sensors.outdoor.temp.status );
						E.rr( self.humidity_rel.status
								, Sensors.outdoor.humidity_rel.status );

						self.temp.status = ( self.temp.status * 9
								+ Sensors.outdoor.temp.status ) / 10;
						self.humidity_rel.status = ( self.humidity_rel.status * 9
								+ Sensors.outdoor.humidity_rel.status ) / 10;

						E.rr( self.temp.status
								, Sensors.outdoor.temp.status );
						E.rr( self.humidity_rel.status
								, Sensors.outdoor.humidity_rel.status );

					} else {
						self.temp.status -= .1;
						self.humidity_rel.status += .5;
					}
				}

				self.humidity_abs.status = calcAbsoluteHumidity(
						self.temp.status, self.humidity_rel.status );

			}

			self.temp.run( emit );
			self.humidity_rel.run( emit );
			self.humidity_abs.run( emit );

			/*
			if( conf.mode == 'simulate' ) {

				if( self.fan.status == 0 ) {

					self.indoor.humidity_rel += .1;
				} else {
					self.indoor.humidity_rel -= .1;
				}

				if( self.mode.status == 'auto' ) {
					if( self.indoor.humidity_abs > self.outdoor.humidity_humidity
				}
			}
			*/
		}

	}

	return self;
}

