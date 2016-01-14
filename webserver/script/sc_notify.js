"use strict";

var Assert = require( '../assert.js' ),
    E = require( '../E.js' )
    ;

module.exports = function( args, config, env ){

	var self = {

		start: function( current, boiler ) {
			current.desc = "Notify " + args.what;
			if( args.msg ) current.desc += " " + args.msg;
		},
		run: function( current, boiler ) {

			if( current.mode != 'run' ) return;

			boiler.indicator._notify( args.what );
			env.notify( boiler, args.what, args.msg );

			current.mode = 'done';
		}
	}
	return self;
};

