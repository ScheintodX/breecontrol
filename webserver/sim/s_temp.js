"use strict";

var E = require( '../E.js' );

function rndOf( min, max ) {

	return Math.random() * ( max-min ) + min;
}
function mix( val, factor, min, max ) {

	return ( (factor-1)*val + rndOf( min, max ) ) / factor;
}

module.exports = function( conf ) {

	var rN = conf.nominal.range,
		rS = conf.status.range
		;

	var self = {

		conf: conf,

		nominal: 0,
		status: 0,

		run: function( emit ) {

			if( conf.random ) {

				self.nominal = mix( self.nominal, 5, rN[0], rN[1] );
				self.status = mix( self.status, 5, rS[0], rS[1] );

			} else {

				if( self.nominal != self.status ) {

					var diff = self.nominal - self.status;

					if( diff > 0 ) {
						// heating linear
						self.status += 2*conf.speed;
					} else {
						// cooling progressive
						self.status += diff/10*conf.speed;
					}
				}
			}

			emit( conf.topic + '/nominal', self.nominal.mqtt( 1 ) );
			emit( conf.topic + '/status', self.status.mqtt( 1 ) );
		},
		msg: function( emit, topic, data ) {

			if( topic.match( /\/set$/ ) ) {
				self.nominal = parseFloat( data );
				conf.random = false;
			}
		}
	}
	return self;
};
