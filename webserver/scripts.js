"use strict";

var fs = require( 'fs' );
var _ = require( 'underscore' );
var log = require( './logging.js' );

var E = require( './E.js' );

var _CONFIG_ = 'scriptconfig/',
	_SCRIPT_ = 'script/';

function save( name, data, done ) {

	var file = _CONFIG_ + name + '.json',
	    data = JSON.stringify( data );

	log.trace( "SAVE", file );

	fs.writeFile( file, data, "utf-8", done );
	
	return done();
}

function load( name, done ) {

	log.trace( "LOAD", name ); // log

	var file = _CONFIG_ + name;

	fs.readFile( file, "utf-8", function( err, data ) {

		if( err ) return done( err );

		try {
			var scriptconfig = JSON.parse( data );

			var Script = require( './' + _SCRIPT_ + scriptconfig.script );

		} catch( ex ) {
			return done( ex );
		}

		return done( null, Script, scriptconfig );

	} );
}

function list( done ) {

	log.info( "LIST" ); // log

	fs.readdir( _CONFIG_, function( err, data ) {

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
	save: save
};
