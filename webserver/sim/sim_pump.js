"use strict";

var E = require( '../E.js' );
require( '../polyfill.js' );
require( './patch.js' );

var SFloat = require( './s_float.js' ),
	SBool = require( './s_bool.js' ),
	ABool = require( './a_bool.js' ),
	AOnOffAuto = require( './a_onoffauto.js' ),
	APumpController = require( './a_pumpcontroller.js' ),
	SRefiller = require( './s_refiller.js' )
	;

module.exports = function( DEVICE ) {

	var self = {

		_conf: {
			device: DEVICE,
			subscriptions: [
				DEVICE + '/pump/mode/set'
			]
		},

		pump: APumpController( {
			topic: DEVICE + '/pump/on',
			status: { initial: false },
			freq: .5,
			iv: 300,
			mode: 'simulate',
			on: 60, //%
			off: 40 //%
		} ),

		mode: AOnOffAuto( {
			topic: DEVICE + '/pump/mode',
			status: { initial: 'off' },
			initial: 'off',
			timeout: 5000,
			freq: .1,
			iv: 700,
			mode: 'simulate'
		} ),

		fill: SRefiller( {
			topic: DEVICE + '/fill',
			status: { range: [ 0, 30 ], initial: 20 },
			iv: 1000,
			mode: 'simulate'
		} ),

		temp: SFloat( {
			topic: DEVICE + '/temp',
			status: { range: [ 0, 30 ], initial: 20 },
			iv: 2000,
			mode: 'simple'
		} )
	}

	return self;
};


