"use strict";

var Assert = require( './assert.js' );

module.exports = function( param ){

	Assert.present( 'param.time', param.temp );
	Assert.present( 'config.hysteresis', config.hysteresis );

	var start = false;

	var Cmd = {

		start: function( param, boiler ) {

			start = param.now;

			boiler.jacket.upper.power.set = config.jacket.upper.power;
			boiler.jacket.upper.temp.set = config.jacket.temp.power;
			boiler.jacket.lower.power.set = config.jacket.lower.power;
			boiler.jacket.upper.temp.set = config.jacket.temp.power;
		},

		run: function( param, boiler ) {

			if( param.now - start < param.time ) {

				return { status: 'running' };
			} else {
				return { status: 'done' };
			}
		}
	}
	return Cmd;
};
