"use strict";

var Assert = require( './assert.js' );

module.exports = function( args, config ){

	Assert.present( 'args.temp', args.temp );
	Assert.present( 'config.hysteresis', config.hysteresis );

	var Cmd = {

		start: function( param, boiler ) {

			boiler.temp.set = args.temp;
			boiler.upper.power.set = config.upper.power;
			boiler.upper.temp.set = config.temp.power;
			boiler.lower.power.set = config.lower.power;
			boiler.upper.temp.set = config.temp.power;
		},

		run: function( param, boiler ) {

			if( boiler.temp.status < args.temp ) {

				return { status: 'running' };
			} else {
				return { status: 'done' };
			}
		}

	}
	return Cmd;
};

