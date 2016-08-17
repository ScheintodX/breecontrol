"use strict";

require( './polyfill.js' );

var E = require( './E.js' );

var H = require( './helpers.js' );

var log = require( './logging.js' );

var InProxy = require( './sensor/in_proxy.js' ),
	OutProxy = require( './sensor/out_proxy.js' ),
	InOutProxy = require( './sensor/inout_proxy.js' ),
	Combined = require( './sensor/combined.js' )
	;

function createPump( index, config ) {

	var self = Object.assign( {

		name: config.name,
		index: index,
		conf: config,

	}, Combined( {

		temp: InProxy( {
			type: 'f',
			timeout: 2500
		} ),
		fill: InProxy( {
			type: 'f',
			timeout: 2500
		} ),
		pump: Combined( {}, {
			mode: InOutProxy( {
					type: 's',
					timeout: 3000
				}, { set: 'auto' }
			),
			on: InProxy( {
				type: 'b',
				timeout: 3000
			}, {} )
		} )

	} ), {

		watch: function() {

		},

		power: function() {

			if( self.pump.on.status ) return self.conf.power;

			return 0;
		},

		powerLimit: function( limit ) {

			if( limit < self.conf.power ) self.pump.mode.set = 'off';
		}

	} );

	return self;
};

module.exports = {};

module.exports.create = createPump;
