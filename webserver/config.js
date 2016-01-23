"use strict";

module.exports = function( done ) {

	return done( null, {

		ws: {
			port: 8765,
		},

		updateIntervalCtrl: 500,
		updateIntervalWeb: 500,
		updateIntervalMqtt: 1000,

		mqtt: {
			url: 'mqtt://localhost:1883/',
			username: 'braumeister',
			password: 'braumeister',
			prefix: 'griesbraeu/'
		},

		boilers: [
			{
				name: "boiler1",
				minTemp:   0, //°C
				maxTemp: 100, //°C
				capacity: 80, // L
				efficency: .8,
				power: 9.000, // kw
				upper: { minTemp: 0, maxTemp: 300 },
				lower: { minTemp: 0, maxTemp: 300 }
			}, {
				name: "Kurt von Kessel",
				minTemp:   0, //°C
				maxTemp: 100, //°C
				capacity: 80, // L
				efficency: .8,
				power: 9.000, // kw
				upper: { minTemp: 0, maxTemp: 300 },
				lower: { minTemp: 0, maxTemp: 300 }
			}
		],

		script: {
			time: function() {
				// Fast
				return (new Date().getTime()/10)<<0;
			}
		}

	} );
}
