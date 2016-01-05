"use strict";

module.exports = function( done ) {

	return done( null, {

		state: {
			file: '.STATE.json'
		},

		ws: {
			port: 8765,
		},

		updateIntervalWeb: 1000,
		updateIntervalMqtt: 1000,

		mqtt: {
			url: 'mqtt://localhost:1883/',
			username: 'brewmaster',
			password: 'dBPg09K6U34m'
		},

		boilers: [
			{
				name: "Bernd der Braubottich",
				minTemp: 0,
				maxTemp: 100,
				jackets: {
					upper: { minTemp: 0, maxTemp: 300 },
					lower: { minTemp: 0, maxTemp: 300 }
				}
			}, {
				name: "Kurt von Kessel",
				minTemp: 0,
				maxTemp: 100,
				jackets: {
					upper: { minTemp: 0, maxTemp: 300 },
					lower: { minTemp: 0, maxTemp: 300 }
				}
			}
		],

		scripts: {
			heat: {
				boiler: {
					jacket: {
						upper: { power: .8, temp: 250 },
						lower: { power: 1, temp: 300 }
					}
				}
			},
			hold: {
				boiler: {
					jacket: {
						upper: { power: .5, temp: 200 },
						lower: { power: .5, temp: 200 }
					}
				}
			}
		}

		/*
		, fields: {

			jacket: {
				upper: {
					temp: {
						status: "f",
						nominal: "f"
					},
					power: {
						status: 'f'
					},
					heater: {
						status: 'b'
					}
				}
			}
		}
		*/
	} );
}
