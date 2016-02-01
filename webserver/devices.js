"use strict";

require( './polyfill.js' );

var E = require( './E.js' ),
	Assert = require( './assert.js' );

module.exports = {};

module.exports.createAll = function( config, done ) {

	Assert.present( "config", config );

	var result = {};

	for( var i=0; i < config.length; i++ ) {

		var deviceConfig = config[ i ],
			Factory = require( './' + deviceConfig.type + '.js' );


		result[ 'boiler' + (i+1) ] = Factory.create( i, deviceConfig );
	}

	return done( null, result );
};
