"use strict";

var Assert = require( './assert.js' );

module.exports = function( args, config ){

	Assert.present( 'args.temp', args.temp );
	Assert.present( 'config.hysteresis', config.hysteresis );

	var Cmd = {

		start: function( param, boiler ) {

			boiler.temp.set = args.temp;
			boiler.jacket.upper.power.set = config.jacket.upper.power;
			boiler.jacket.upper.temp.set = config.jacket.temp.power;
			boiler.jacket.lower.power.set = config.jacket.lower.power;
			boiler.jacket.upper.temp.set = config.jacket.temp.power;
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

