"use strict";

module.exports = function( conf ) {

	console.log( conf );

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
		},

		msg: function( emig, topic, data ) {

			if( topic.match( /\/set$/ ) ){
				self.nominal = parseFloat( data );
				self.conf.random=false;
			}


		}
	}

	return self;

};
