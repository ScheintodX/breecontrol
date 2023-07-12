import { Assert } from '../assert.js';
import { E } from '../E.js';

import InProxy from '../sensor/in_proxy.js';
import Combined from '../sensor/combined.js';

export default function createPowerguard( config, index ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		power_used: InProxy( {
			type: 'f'
		} ),
		power_max: InProxy( {
			type: 'f'
		} )

	} ), {

		watch: function( brewery ) {

			var max = self.conf.maxPower,
				sum = 0;

			for( var i=0; i < self.conf.watched.length; i++ ) {

				var device = self.conf.watched[ i ];

				var dev = brewery.devices[ device ];

				Assert.present( "device '" + device + "'", dev );

				if( !( 'power' in dev ) ) continue;

				var power = dev.calculatePower(),
					expected = power + sum
					;;

				if( expected > max ) {

					var limit = max - sum;
					dev.powerLimit( limit );
					if( 'warn' in dev ) {
						E.rr( "Limit power to: ", limit );
						dev.warn.warn( 'Limiting power to: ' + limit + "W" );
					}
				}

				sum += dev.calculatePower(); // get power again because we need the real limited value;

			}

			self.power_max.status = max;
			self.power_used.status = sum;
		}

	} );

	return self;
}
