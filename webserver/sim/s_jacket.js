"use strict";

var SBool = require( './s_bool.js' ),
	AFloat = require( './a_float.js' ),
	STemp = require( './s_temp.js' )
	;


module.exports = function( conf ) {

	var r = conf.range
		;

	var Sensor = {

		conf: conf,

		temp: STemp( conf.temp ),
		power: AFloat( conf.power ),
		heater: SBool( conf.heater ),

		run: function( emit ) {

			Sensor.temp.run( emit );
			Sensor.power.run( emit );
			Sensor.heater.run( emit );
		},

		msg: function( emit, topic, data ) {

			if( topic.match( /\/temp\// ) ) Sensor.temp.run( emit );
			if( topic.match( /\/power\// ) ) Sensor.power.run( emit );
			if( topic.match( /\/heater\// ) ) Sensor.heater.run( emit );
		}

	}

	return Sensor;
}
