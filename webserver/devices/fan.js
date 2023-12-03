import InProxy from '../sensor/in_proxy.js';
import InOutProxy from '../sensor/inout_proxy.js';
import Combined from '../sensor/combined.js';

export default function createFan( config, index ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		indoor: Combined( {}, {
			temp: InProxy( {
				type: 'f',
				timeout: 2500
			} ),
			humidity_rel: InProxy( {
				type: 'f',
				timeout: 2500
			} ),
			humidity_abs: InProxy( {
				type: 'f',
				timeout: 2500
			} )
		} ),
		outdoor: Combined( {}, {
			temp: InProxy( {
				type: 'f',
				timeout: 2500
			} ),
			humidity_rel: InProxy( {
				type: 'f',
				timeout: 2500
			} ),
			humidity_abs: InProxy( {
				type: 'f',
				timeout: 2500
			} )
		} ),
		fan: Combined( {}, {
			mode: InOutProxy( {
					type: 's',
					timeout: 3000
				}, { set: 'auto' }
			),
			on: InProxy( {
				type: 'b',
				timeout: 3000
			}, {} )
		} )

	} ), {

		watch: function() {

		},

		power: function() {

			if( self.fan.on.status ) return self.conf.power;

			return 0;
		},

		powerLimit: function( limit ) {

			if( limit < self.conf.power ) self.fan.mode.set = 'off';
		}

	} );

	return self;
};
