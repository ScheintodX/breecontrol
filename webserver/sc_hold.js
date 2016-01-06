"use strict";

var Assert = require( './assert.js' );

module.exports = function( param ){

	Assert.present( 'param.time', param.temp );
	Assert.present( 'config.hysteresis', config.hysteresis );

	var start = false;

	var Cmd = {

		start: function( param, boiler ) {

			start = param.now;

			boiler.upper.power.set = config.upper.power;
			boiler.upper.temp.set = config.temp.power;
			boiler.lower.power.set = config.lower.power;
			boiler.upper.temp.set = config.temp.power;
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
