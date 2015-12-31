"use strict";

var _FILE_ = "STATE.json";

var fs = require( 'fs' );
var log = require( './logging.js' );

var _data;

module.exports = function( done ) {

	if( ! fs.existsSync( _FILE_ ) ) {
		log.warn( "Cannot find: '" + _FILE_ + "' starting with empty state" );
		_data = {};
		return done( null, _data );
	}

	fs.readFile( _FILE_, "utf-8", function( err, data ) {

		log.trace( "LOADED %s", _FILE_, data );

		if( err ) return done( err );

		try {
			_data = JSON.parse( data );
		} catch( ex ) {
			log.warn( "Cannot read: '" + _FILE_ + "' starting with empty state" );
			_data = {};
			return done( null, _data );
		}

		return done( null, _data );
	} );

};

module.exports.save = function( done ) {

	var data = JSON.stringify( _data, null, '\t' );

	fs.writeFile( _FILE_, data, function( err ) {

		if( err ) return done( err );

		return done();
	} );

};
