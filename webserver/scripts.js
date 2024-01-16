/**
 * Load / Save scripts
 * List available scripts
 */

import E from './E.js';
import fs from 'fs/promises';
//import _ from 'underscore';
import master from './logging.js';
const log = master.module( "scripts" );
log.trace( "fubar" );

import { Json as JS } from './helpers.js';

var _CONFIG_ = 'scriptconfig/',
	_SCRIPT_ = 'script/';

/**
 * Save script (config) to filesystem
 */
export function sc_save( devicetype, name, data ) {

	var file = _CONFIG_ + devicetype + "/" + name + '.json',
	    data = JS.stringifyPublic( data, true );

	log.trace( "SAVE", file );

	return fs.writeFile( file, data, "utf-8" ); // chain done
}

/**
 * Load script (config) from filesystem
 * Then load master-script via require and return both to callback
 */
export async function sc_load( devicetype, name ) {

	log.trace( "LOAD", devicetype, name ); // log

	var file = _CONFIG_ + devicetype + "/" + name;

	try {
		var data = await fs.readFile( file, "utf-8" );

		var scriptconfig = JSON.parse( data );

		var scriptfile = './' + _SCRIPT_ + devicetype + "/" + scriptconfig.script;

		log.trace( "LOAD: " + scriptfile );

		var Module = await import( scriptfile ),
		    Script = Module.default;

		var result = [Script, scriptconfig];

		return result;

	} catch( e ){

		E.rr( e );
		log.error( `Cannt load {file}` );

		return [];
	}
}

/**
 * List scripts (files) in script directory
 */
export async function sc_list( devicetype ) {

	log.info( "LIST", devicetype ); // log

	var path = _CONFIG_ + devicetype;

	try {
		var data = await fs.readdir( path );

		var result = data.map( ( file ) => {

			if( file.startsWith( '.' ) ) return undefined;
			if( !file.endsWith( '.json' ) ) return undefined;

			return {
				file: file,
				name: file.replace( /\.json$/, '' ),
				description: "not given"
			};
		} ).filter( it => it !== undefined );

		//var res = _.filter( result, function( entry ) { return (entry); } );

		return {[devicetype]:result};

	} catch( e ){

		return false;
	}
}
