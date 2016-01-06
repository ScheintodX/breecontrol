"use strict";

module.exports = function( done ) {

	return done( null, {

		updateInterval: 1000,

		mqtt: {
			url: 'mqtt://localhost:1883/',
			username: 'kesselmeister',
			password: 'dpx7R7yqYY04'
		}

	} );
}
