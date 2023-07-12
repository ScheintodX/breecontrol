//GREEN } from './colors.js';
import 'colors';

import fs from 'fs';

//This is blocking because we want logging "just to be there"

import Tracer from 'tracer';

export const log = Tracer.colorConsole( {
	level: 'info',
	inspectOpt: { depth: 3 },
	transport : function( data ) {
		if( log.pause ) return;
		if( log.FILE ) {
			fs.open( log.FILE, 'a', '0666', function( err, id ) {
				if( err ) throw new Error( err ); //fail fast!
				fs.write( id, data.output+"\n", null, 'utf8', function( err ) {
					fs.close( id );
					if( err ) throw new Error( err );
				});
			});
		} else {
			console.log( data.output );
		}
	}
} );

log.FILE = null;
log.pause = false;

log.startup = function( part, state ) {
	console.log( part + ' ' + state.green );
	log.info.apply( log, arguments );
}
log.failure = function( part, err ) {
	console.log( part + ' ' + err.red );
	log.error.apply( log, arguments );
}
log.ex = function( ex ) {
	console.error.apply( console, arguments );
	log.error.apply( arguments );
	if( ex.stack ){
		console.error( ex.stack );
		log.error.apply( ex.stack );
	}
}

log.file = function( file ) {
	log.FILE = file;
	return log;
}

log.pause = function( value ) {
	log.pause = value;
	return log;
}
