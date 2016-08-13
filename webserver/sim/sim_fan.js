"use strict";

var E = require( '../E.js' );
require( '../polyfill.js' );
require( './patch.js' );

var SFloat = require( './s_float.js' ),
	SBool = require( './s_bool.js' ),
	ABool = require( './a_bool.js' ),
	AOnOffAuto = require( './a_onoffauto.js' ),
	AFanController = require( './a_fancontroller.js' ),
	STempHum = require( './s_temphum.js' )
	;

module.exports = function( DEVICE ) {

	var self = {

		_conf: {
			device: DEVICE,
			subscriptions: [
				DEVICE + '/+/set'
			]
		},

		fan: AFanController( {
			topic: DEVICE + '/fan',
			status: { initial: false },
			freq: .5,
			iv: 300,
			mode: 'simulate',
			offset: 5 //g/m2
		} ),

		mode: AOnOffAuto( {
			topic: DEVICE + '/mode',
			status: { initial: 'off' },
			nominal: { initial: 'off' },
			initial: 'off',
			timeout: 5000,
			freq: .1,
			iv: 700,
			mode: 'simple'
		} ),

		indoor: STempHum( {
			iv: 2000,
			temp: {
				topic: DEVICE + '/indoor/temp',
				status: { range: [ 0, 30 ], initial: 20 },
				iv: 2000,
				mode: 'random'
			},
			humidity_rel: {
				topic: DEVICE + '/indoor/humidity_rel',
				status: { range: [ 0, 100 ], initial: 60 },
				iv: 2000,
				mode: 'random'
			},
			humidity_abs: {
				topic: DEVICE + '/indoor/humidity_abs',
				status: { range: [ 0, 50 ], initial: 25 },
				iv: 2000,
				mode: 'random'
			}
		} ),

		outdoor: STempHum( {
			iv: 2000,
			temp: {
				topic: DEVICE + '/outdoor/temp',
				status: { range: [ 0, 40 ], initial: 25 },
				iv: 2000,
				mode: 'random'
			},
			humidity_rel: {
				topic: DEVICE + '/outdoor/humidity_rel',
				status: { range: [ 0, 100 ], initial: 60 },
				iv: 2000,
				mode: 'random'
			},
			humidity_abs: {
				topic: DEVICE + '/outdoor/humidity_abs',
				status: { range: [ 0, 50 ], initial: 25 },
				iv: 2000,
				mode: 'random'
			}
		} )
	}

	return self;
};


