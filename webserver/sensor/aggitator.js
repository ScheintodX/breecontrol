import InOut from './inout_proxy.js';

export default function( conf, defaults ) {

	var self = InOut( conf, defaults );

	self.watch = function( boiler, warn ) {

		if( ( self.status || self.set ) && !( boiler.lid.status ) ) {
			warn.warn( "Aggitator on with Lid open" );
			if( boiler.lid.override ) {
				warn.severe( "OVERRIDE" );
			} else {
				self.setTo( 0 );
			}
		}
	}

	return self;
};
