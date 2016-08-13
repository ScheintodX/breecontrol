"use strict";

var E = require( '../E.js' );

var SFloat = require( './s_float.js' )
	;

function calcAbsoluteHumidity( t, rh ) {

	var sat = 6.1078 * pow( 10, ( 7.5 * t ) / ( 237.3 * t ) ); // Sättigungsdampfdruck
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

			self.temp.run( emit );
			self.humidity_rel.run( emit );
			self.humidity_abs.run( emit );

			if( conf.mode == 'simulate' ) {
 
				self.indoor.humidity_abs = calcAbsoluteHumidity(
					self.indoor.temp.status, self.indoor.humidity_rel );

				self.outdoor.humidity_abs = calcAbsoluteHumidity(
					self.outdoor.temp.status, self.outdoor.humidity_rel );
			}

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

