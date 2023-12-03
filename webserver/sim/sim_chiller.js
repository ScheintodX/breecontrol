import './patch.js';
import { E } from "../E.js";
import _ from "underscore";

import AJacket from './a_jacket.js';
import SInnerTemp from './s_inner_temp.js';


export default function SimChiller( DEVICE ) {

	var self = {

		_conf: {
			device: DEVICE,
			subscriptions: [
				DEVICE + '/+/set',
				DEVICE + '/jacket/+/set'
			]
		},

		jacket: AJacket( {
			topic: DEVICE + '/jacket',
			temp: {
				topic: DEVICE + '/jacket/temp',
				status: { range: [ -20, 500 ], initial: 19 },
				nominal: { range: [ 0, 300 ], initial: 0 },
				timeout: 5000,
				mode: 'simulate'
			},
			cooler: {
				topic: DEVICE + '/jacket/cooler',
				status: { initial: false },
				req: .5,
				mode: 'simulate'
			},
			speed: 10,
			jitter: 2,
			min: 1,
			iv: 1000,
			mode: 'simulate'
		} ),

		temp: SInnerTemp( {
			topic: DEVICE + '/temp',
			status: { range: [ -20, 200 ], initial: 14 },
			mode: 'simulate',
			iv: 1000,
			speed: .3,
			jitter: .1
		} )
	}

	return self;
};
