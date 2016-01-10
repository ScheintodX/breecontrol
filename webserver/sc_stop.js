"use strict";

var Assert = require( './assert.js' ),
    E = require( './E.js' )
    ;

module.exports = function( args, config, env ){

	var self = {

		start: function( current, boiler ) {

			current.desc = "Stop";

			E.rr( "start stop", current.desc );
		},

		run: function( current, boiler ) {

			if( current.mode != 'run' ) return current.mode;

			current.mode = 'stop';
		}
	}
	return self;
};

