export default function Config(){

	return new Promise( (resolve) => {

		resolve( {

			ws: {
				port: 3001,
			},

			updateIntervalCtrl: 500,
			updateIntervalWeb: 500,
			updateIntervalMqtt: 1000,

			mqtt: {
				url: 'mqtt://localhost:1883/',
				client: "braumeister",
				username: 'braumeister',
				password: '3oropMLRr7PvFpFEhHVijqDH',
				prefix: 'pottery/'
			},

			brewery: {
				maxPower: 22080
			},

			devices: [
				{
					id: 'kiln',
					type: 'kiln',
					name: 'Kera der Großklotz',
					minTemp: 0,
					maxTemp: 1300,
					power: 18000
				}/*, {
					id: 'boiler1',
					type: "boiler",
					name: "Bernd der Bottich",
					minTemp:   0, //°C
					maxTemp: 100, //°C
					capacity: 180, // L
					efficency: .8,
					power: 9000, // W
					upper: { minTemp: 0, maxTemp: 450 },
					lower: { minTemp: 0, maxTemp: 450 }
				}, {
					id: 'fan1',
					type: 'fan',
					name: 'Soeder',
					power: 400
				}, {
					id: 'pump1',
					type: 'pump',
					name: 'Arni',
					power: 400
				}/*, {
					id: 'boiler2',
					type: "boiler",
					name: "Kurt von Kessel",
					minTemp:   0, //°C
					maxTemp: 100, //°C
					capacity: 80, // L
					efficency: .8,
					power: 9000, // W
					upper: { minTemp: 0, maxTemp: 300 },
					lower: { minTemp: 0, maxTemp: 300 }
				}, {
					id: 'gloggmaker1',
					type: "gloggmaker",
					name: "Willi Weck",
					minTemp:   0, //°C
					maxTemp: 100, //°C
					capacity: 30, // L
					efficency: .7,
					power: 2000, // W
					lower: { minTemp: 0, maxTemp: 300 }
				}, {
					id: 'chiller1',
					type: "chiller",
					name: "Franz Frost",
					minTemp:   0, //°C
					maxTemp: 100, //°C
					capacity: 100, // L
					efficency: .7,
					power: 1000, // W
					lower: { minTemp: 0, maxTemp: 100 }
				}, {
					id: 'pg',
					type: "powerguard",
					name: "powerguard",
					maxPower: 22080, // W
					watched: [ 'kiln1' /*'pump1', 'fan1', 'boiler1', 'boiler2', 'gloggmaker1', 'chiller1'
					]
				}*/

			],

			script: {
				time: function() {
					// Fast
					//return (new Date().getTime()/10)<<0;
					//return (new Date().getTime()/(1000/60))<<0;
					return (new Date().getTime()/1000)<<0;
				}
			}

		} );
	} );
}
