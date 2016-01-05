"use strict";

var fs = require( 'fs' );
var log = require( './logging.js' );

var E = require( './E.js' );

var _BASE_ = "scripts/";

var SC = {
	heat: require( './sc_heat.js' ),
	hold: require( './sc_hold.js' )
};

function buildScript( script, done ) {

	var Script = {

		script: script,

		run: []
	}

	for( var i=0; i < script.steps.length; i++ ) {

		var step = script.steps[ i ];

		if( !( step.action in SC ) )
				return done( "Unknown step: " + step.action );

		var sc = SC[ step.action ]( step );

		Script.run.push( sc );
	}

	return done( null, Script );
}

function save( name, done ) {

	var data = JSON.stringify( this.script );

	fs.writeFile( _BASE_ + name, data, "utf-8", done );
}

function load( name, done ) {

	E.rr( "LOAD", data.value.load ); // log

	var json;

	fs.readFile( _BASE_ + name, "utf-8", function( err, data ) {

		if( err ) return done( err );

		try {
			var script = JSON.parse( data );

			return boildScript( script, done );
		} catch( ex ) {
			return done( ex );
		}

	} );
}

module.exports = function( what, done ) {

	if( typeof what == 'string' ) {

		E.rr( "LoadFile" );

		return load( what, done );
	} else {
		E.rr( "set script" );
		return buildScript( what, done );
	}
}
