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

		brewery: {
			maxPower: 12000
		},

		devices: [
			{
				id: 'boiler1',
				type: "boiler",
				name: "Bernd der Bottich",
				minTemp:   0, //°C
				maxTemp: 100, //°C
				capacity: 180, // L
				efficency: .8,
				power: 9.000, // kw
				upper: { minTemp: 0, maxTemp: 300 },
				lower: { minTemp: 0, maxTemp: 300 }
			}/*, {
				id: 'boiler2',
				type: "boiler",
				name: "Kurt von Kessel",
				minTemp:   0, //°C
				maxTemp: 100, //°C
				capacity: 80, // L
				efficency: .8,
				power: 9.000, // kw
				upper: { minTemp: 0, maxTemp: 300 },
				lower: { minTemp: 0, maxTemp: 300 }
			}, {
				id: 'gloggmaker1',
				type: "gloggmaker",
				name: "Willibald Weck",
				minTemp:   0, //°C
				maxTemp: 100, //°C
				capacity: 30, // L
				efficency: .7,
				power: 2.000, // kw
				lower: { minTemp: 0, maxTemp: 300 }
			}, {
				id: 'chiller1',
				type: "chiller",
				name: "Franz Frost",
				minTemp:   0, //°C
				maxTemp: 100, //°C
				capacity: 100, // L
				efficency: .7,
				power: 1.000, // kw
				lower: { minTemp: 0, maxTemp: 100 }
			}*/

		],

		script: {
			time: function() {
				// Fast
				//return (new Date().getTime()/10)<<0;
				return (new Date().getTime()/(1000/60))<<0;
			}
		}

	} );
}
