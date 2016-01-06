"use strict";

module.exports = function( done ) {

	return done( null, {

		state: {
			file: '.STATE.json'
		},

		ws: {
			port: 8765,
		},

		updateIntervalWeb: 100,
		updateIntervalMqtt: 1000,

		mqtt: {
			url: 'mqtt://localhost:1883/',
			username: 'braumeister',
			password: 'dBPg09K6U34m'
		},

		boilers: [
			{
				name: "Bernd der Braubottich",
				minTemp: 0,
				maxTemp: 100,
				upper: { minTemp: 0, maxTemp: 300 },
				lower: { minTemp: 0, maxTemp: 300 }
			}, {
				name: "Kurt von Kessel",
				minTemp: 0,
				maxTemp: 100,
				upper: { minTemp: 0, maxTemp: 300 },
				lower: { minTemp: 0, maxTemp: 300 }
			}
		],

		scripts: {
			heat: {
				boiler: {
					upper: { temp: 250 },
					lower: { temp: 300 }
				}
			},
			hold: {
				boiler: {
					upper: { temp: 200 },
					lower: { temp: 200 }
				}
			}
		}

	} );
}
