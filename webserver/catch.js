"use strict";

var E = require( './E.js' );

var _log;

function gotError( done, err, mod ) {

	console.log( "Got Error: " + err + ' in ' + mod );
	if( err.stack ) console.log( err.stack );

	if( _log ) {
		_log.error( "Got Error: " + err + ' in ' + mod );
		if( err.stack ) _log.error( err.stack );
	}

	if( done ) return done( err );
}

var self = {

	ExitOn: function( mod, f ) {

		return function( err ) {

			if( err ) {
				gotError( null, err, mod )
				process.exit( 1 );
			}
			f.apply( null, arguments );
		};
	},

	ContinueOn: function( mod, f ) {

		return function( err ) {

			if( err ) {
				gotError( null, err, mod )
			}
			f.apply( null, arguments );
		};
	},

	fatal: function( mod, f ) {

		return function() {

			try {
				f.apply( null, arguments );
			} catch( ex ) {
				gotError( null, ex, mod );
				process.exit( 1 );
			}
		}
	},

	resume: function( mod, f ) {

		return function() {

			try {
				f.apply( null, arguments );
			} catch( ex ) {
				gotError( null, ex, mod );
			}
		}
	},

	log: function( log ) {
		_log = log;
		return self;
	}
};

module.exports = self;
