"use strict";

module.exports = function( conf ) {

	var self = {

		conf: conf,

		status: false,

		run: function( emit ) {

			if( conf.random ) {
				if( Math.random() < conf.freq ) self.status = !self.status
			}

			emit( conf.topic + '/status', '' + self.status.mqtt() )
		}
	}
	return self;
};
