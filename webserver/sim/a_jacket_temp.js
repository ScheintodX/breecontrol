"use strict";

var HQ = require( '../helpers.js' ).mqtt;
var E = require( '../E.js' );
var AFloat = require( './a_float.js' );
var _ = require( 'underscore' );

function rndOf( min, max ) {

	return Math.random() * ( max-min ) + min;
}
function mix( val, factor, min, max ) {

	return ( (factor-1)*val + rndOf( min, max ) ) / factor;
}

module.exports = function( conf ) {

	var parent = AFloat( conf ),
		parentRun = parent.run;

	var self = _.extend( parent, {

		conf: conf,

		run: function( emit ) {

			parentRun( emit );
		}
	} );
	return self;
};
