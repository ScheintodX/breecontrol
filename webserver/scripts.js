"use strict";

var fs = require( 'fs' );
var _ = require( 'underscore' );
var log = require( './logging.js' );

var E = require( './E.js' );

var _BASE_ = "scripts/";

function save( name, done ) {

	E.rr( "SAVE", name );

	var data = JSON.stringify( this.script );

	//fs.writeFile( _BASE_ + name, data, "utf-8", done );
	done();
}

function load( name, done ) {

	log.trace( "LOAD", name ); // log

	var json;

	fs.readFile( _BASE_ + name, "utf-8", function( err, data ) {

		if( err ) return done( err );

		try {
			var script = JSON.parse( data );

			var Script = require( './' + _BASE_ + script.script );

			done( null, Script, script );

		} catch( ex ) {
			return done( ex );
		}

	} );
}

function list( done ) {

	log.info( "LIST" ); // log

	fs.readdir( _BASE_, function( err, data ) {

		if( err ) return done( err );

		var result = _.map( data, function( file ) {

			if( file.startsWith( '.' ) ) return undefined;
			if( !file.endsWith( '.json' ) ) return undefined;

			return { file: file,
					name: file.replace( /\.json$/, '' ),
					description: "not given" };
		} );

		result = _.filter( result, function( entry ) { return (entry); } );

		return done( null, result );
	} );
}

module.exports = {
	list: list,
	load: load,
	parse: function(){ E.rr( "not implemented" ); }
};
