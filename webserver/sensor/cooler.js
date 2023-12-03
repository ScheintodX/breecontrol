import InOut from './inout_proxy.js';

export default function( conf, defaults ) {

	var self = InOut( conf, defaults );

	self.watch = function( boiler, warn ) {

		if( typeof self.status == "undefined" ) {
			warn.severe( "Unknown coller temp" )
			self.setTo( 0 );
		}
	}

	return self;
}
