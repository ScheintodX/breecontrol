"use strict";

var fs = require( 'fs' );
var log = require( './logging.js' );
var Assert = require( './assert.js' );

var Catch = require( './catch.js' );

var _data;

var _file;

module.exports = function( config, done ) {

	Assert.present( 'config.state.file', config.file );

	_file = config.file;

	if( ! fs.existsSync( _file ) ) {
		log.warn( "Cannot find: '" + _file + "' starting with empty state" );
		_data = {};
		return done( null, _data );
	}

	fs.readFile( _file, "utf-8", function( err, data ) {

		log.trace( "LOADED %s", _file, data );

		if( err ) return done( err );

		try {
			_data = JSON.parse( data );
		} catch( ex ) {
			log.warn( "Cannot read: '" + _file + "' starting with empty state" );
			_data = {};
			return done( null, _data );
		}

		return done( null, _data );
	} );

};

module.exports.save = function( done ) {

	var data = JSON.stringify( _data, null, '\t' );

	fs.writeFile( _file, data, function( err ) {

		if( err ) return done( err );

		return done();
	} );

};

function stateSaved( err ) {

	log.trace( "STATE saved" );
}

module.exports.start = function( interval ) {

	setInterval( function() {

		module.exports.save( Catch.ContinueOn( "State save", stateSaved ) );

	}, interval );

}
