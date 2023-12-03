import './patch.js';
import { E } from "../E.js";
import _ from "underscore";

import SFloat from './s_float.js';
import SBool from './s_bool.js';
import ABool from './a_bool.js';
import AJacket from './a_jacket.js';
import SInnerTemp from './s_inner_temp.js';


export default function SimGloggmaker( DEVICE ) {

	var self = {

		_conf: {
			device: DEVICE,
			subscriptions: [
				DEVICE + '/+/set',
				DEVICE + '/lower/+/set'
			]
		},

		lower: AJacket( {
			topic: DEVICE + '/lower',
			temp: {
				topic: DEVICE + '/lower/temp',
				status: { range: [ -20, 500 ], initial: 19 },
				nominal: { range: [ 0, 300 ], initial: 0 },
				timeout: 5000,
				mode: 'simulate'
			},
			heater: {
				topic: DEVICE + '/lower/heater',
				status: { initial: false },
				req: .5,
				mode: 'simulate'
			},
			speed: 10,
			jitter: 2,
			iv: 1000,
			mode: 'simulate'
		} ),

		temp: SInnerTemp( {
			topic: DEVICE + '/temp',
			status: { range: [ -20, 200 ], initial: 14 },
			mode: 'simulate',
			iv: 1000,
			speed: .3,
			jitter: .5
		} ),

		fill: SFloat( {
			topic: DEVICE + '/fill',
			status: { range: [ 0, 1 ], initial: .4 },
			iv: 5000,
			mode: 'random'
		} ),
		lid: SBool( {
			topic: DEVICE + '/lid',
			status: { initial: true },
			freq: .5,
			iv: 300,
			mode: 'simple'
		} ),
		aggitator: ABool( {
			topic: DEVICE + '/aggitator',
			status: { initial: false },
			nominal: { initial: false },
			initial: false,
			timeout: 5000,
			freq: .1,
			iv: 700,
			mode: 'simple'
		} ),
		spare: ABool( {
			topic: DEVICE + '/spare',
			status: { initial: false },
			nominal: { initial: false },
			initial: false,
			timeout: 1000,
			freq: .1,
			iv: 700,
			mode: 'random'
		} )
	}

	return self;
}
