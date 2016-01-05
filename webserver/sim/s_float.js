"use strict";

module.exports = function( conf ) {

	var r = conf.range;

	var self = {

		conf: conf,

		status: (r[1]-r[0])/2,

		run: function( emit ) {

			if( conf.random ) {
				var rnd = Math.random() * ( r[1]-r[0]) + r[0];
				self.status = ( 4*self.status + rnd ) / 5;
			}

			emit( conf.topic + '/status', self.status.mqtt( 1 ) )
		}
	}
	return self;
};
