"use strict";

var Assert = require( './assert.js' ),
    E = require( './E.js' );

module.exports = function( args, config, env ){

	Assert.present( 'args.heat', args.heat );
	Assert.present( 'args.hold', args.hold );

	var _pauseStart,
	    _pauseTime = 0;

	var self = {

		start: function( current, boiler ) {

			current.start = env.time();
			current.desc = 'Hold ' + args.heat + '°C for ' + args.hold;

			boiler.temp.set = args.heat;
		},
		pause: function( current, boiler ) {

			_pauseStart = env.time();
			boiler.temp.set = 0;
		},
		resume: function( current, boiler ) {
			
			_pauseTime += env.time() - _pauseStart;
			boiler.temp.set = args.hold;
		},
		stop: function( current, boiler ) {

			boiler.temp.set = 0;
		},
		run: function( current, boiler ) {

			if( current.mode != 'run' ) return;

			current.elapsed = env.time() - current.start - _pauseTime;
			current.remaining = args.hold - current.elapsed;

			if( current.remaining <= 0 ) {
				E.rr( current.desc, "done", current.elapsed, current.remaining );
				current.mode = 'done';
			}
		},

		guessRuntime: function( current, boiler ) {
			return args.hold;
		}
	}
	return self;
};
