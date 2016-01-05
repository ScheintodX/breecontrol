"use strict";

function not( val ) {
	return val == 1 ? 0 : 1;
}

module.exports = function( conf ) {

	var self = {

		conf: conf,

		status: 0,
		nominal: 0,

		run: function( emit ) {

			if( conf.random ) {

				if( Math.random() < conf.freq  ) {
					self.status = not( self.status );
				}
				if( Math.random() < conf.freq  ) {
					self.nominal = not( self.nominal );
				}
			} 

			emit( conf.topic + '/nominal', self.nominal.mqtt( 1 ) );
			emit( conf.topic + '/status', self.status.mqtt( 1 ) );

			// Some delay from nominal to status
			if( !conf.random ) {
				if( self.status != self.nominal ) {
					self.status = self.nominal;
				}
			}

		},

		msg: function( emit, topic, data ) {

			if( topic.match( /\/set$/ ) ){
				self.nominal = parseFloat( data );
				self.conf.random=false;
			}
		}

	};

	return self;
}
