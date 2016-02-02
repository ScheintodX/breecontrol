"use strict";

var E = require( '../E.js' );

var SBool = require( './s_bool.js' ),
	AFloat = require( './a_float.js' )
	;


module.exports = function( conf ) {

	var self = {

		conf: conf,

		temp: AFloat( conf.temp ),
		heater: SBool( conf.heater ? conf.heater : conf.cooler ),

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				var diff = self.temp.nominal - self.temp.status;

				if( diff > 0 ) {
					// heating linear
					self.heater.status = true;
					self.temp.status += 5*conf.speed;
				} else {
					// cooling progressive
					self.heater.status = false;
					self.temp.status += diff/50*conf.speed;
				}

				var min = (typeof conf.min != 'undefined') ? conf.min : 14;

				if( self.temp.status < min ) self.temp.status = min;

				self.temp.status = self.temp.status.jitter( conf.jitter );


			}

			self.temp.run( emit );
			self.heater.run( emit );
		},

		msg: function( emit, topic, data ) {

			if( topic.startsWith( self.temp.conf.topic ) ) {
				self.temp.msg( emit, topic, data );
			}

			if( topic.startsWith( self.heater.conf.topic ) ) {
				self.heater.msg( emit, topic, data );
			}
		}

	}

	return self;
}
