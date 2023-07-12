/**
 * Load / Save scripts
 * List available scripts
 */

import fs from 'fs';
import _ from 'underscore';
import { log } from './logging.js';

import { Json as JS } from './helpers.js';

var _CONFIG_ = 'scriptconfig/',
	_SCRIPT_ = 'script/';

/**
 * Save script (config) to filesystem
 */
function save( name, data, done ) {

	var file = _CONFIG_ + name + '.json',
	    data = JS.stringifyPublic( data, true );

	log.trace( "SAVE", file );

	return fs.writeFile( file, data, "utf-8", done ); // chain done
}

/**
 * Load script (config) from filesystem
 * Then load master-script via require and return both to callback
 */
function load( name, done ) {

	log.trace( "LOAD", name ); // log

	var file = _CONFIG_ + name;

	fs.readFile( file, "utf-8", function( err, data ) {

		if( err ) return done( err );

		try {
			var scriptconfig = JSON.parse( data );

			import( './' + _SCRIPT_ + scriptconfig.script )
					.then( Script => done( null, Skript, scriptconfig ) );

		} catch( ex ) {
			return done( ex );
		}

	} );
}

/**
 * List scripts (files) in script directory
 */
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

export const Scripts = {
	list: list,
	load: load,
	save: save
};
