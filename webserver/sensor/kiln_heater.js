import InOut from './inout_proxy.js';

export default function( conf, defaults ) {

	var self = InOut( conf, defaults );

	self.watch = function( kiln, warn ) {

		if( self.set && ! kiln.door.status ) {
			warn.warn( "Door open: this is dangerous!1elf!" );
			if( kiln.door.override ) {
				warn.severe( "OVERRIDE" )
			} else {
				self.setTo( 0 );
			}
		}

		if( typeof self.status == "undefined" ) {
			warn.severe( "Unknown " + self._conf.name + " temp" )
			self.setTo( 0 );
		}
	}

	return self;
}
