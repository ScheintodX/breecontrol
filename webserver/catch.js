import { E } from './E.js';

var _log;

function gotError( done, err, module ) {

	console.log( "Got Error: " + err + ' in ' + module );
	if( err.stack ) console.log( err.stack );

	if( _log ) {
		_log.error( "Got Error: " + err + ' in ' + module );
		if( err.stack ) _log.error( err.stack );
	}

	if( done ) return done( err );
}

export const Catch = {

	ExitOn: function( module, f ) {

		return function( err ) {

			if( err ) {
				gotError( null, err, module )
				process.exit( 1 );
			}
			f.apply( null, arguments );
		};
	},

	ContinueOn: function( module, f ) {

		return function( err ) {

			if( err ) {
				gotError( null, err, module )
			}
			f.apply( null, arguments );
		};
	},

	fatal: function( module, f ) {

		return function() {

			try {
				f.apply( null, arguments );
			} catch( ex ) {
				gotError( null, ex, module );
				process.exit( 1 );
			}
		}
	},

	resume: function( module, f ) {

		return function() {

			try {
				f.apply( null, arguments );
			} catch( ex ) {
				gotError( null, ex, module );
			}
		}
	},

	log: function( log ) {
		_log = log;
		return this;
	}
};
