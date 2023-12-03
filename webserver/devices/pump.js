import InProxy from '../sensor/in_proxy.js';
import InOutProxy from '../sensor/inout_proxy.js';
import Combined from '../sensor/combined.js';

export default function createPump( config, index ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		temp: InProxy( {
			type: 'f',
			timeout: 2500
		} ),
		fill: InProxy( {
			type: 'f',
			timeout: 2500
		} ),
		pump: Combined( {}, {
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

			if( self.pump.on.status ) return self.conf.power;

			return 0;
		},

		powerLimit: function( limit ) {

			if( limit < self.conf.power ) self.pump.mode.set = 'off';
		}

	} );

	return self;
};
