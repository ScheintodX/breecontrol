"use strict";

var fs = require( 'fs' );
var log = require( './logging.js' );

var _BASE_ = "scripts/";


function buildScript( data ) {

	var script = JSON.parse( data );

	return {
		script: script,

		action: function( boiler, ctrl, state ) {

			function heat( temp ) {
			}

			function hold( time ) {
			}

		}
	}
}

module.exports = function( done, name ) {

	var json;

	fs.readFile( _BASE_ + name, "utf-8", function( err, data ) {

		if( err ) return done( err );

		try {
			return done( null, buildScript( data ) );
		} catch( ex ) {
			return done( ex );
		}

	} );
};
