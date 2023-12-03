import './patch.js';
import { E } from "../E.js";
import _ from "underscore";

import AFloat from './a_float.js';
import SBool from './s_bool.js';
import SKilnTemp from './s_kiln_temp.js';


export default function SimKiln( DEVICE ) {

	var self = {

		_conf: {
			device: DEVICE,
			subscriptions: [
				DEVICE + '/+/set'
			]
		},

		power: AFloat( {
			topic: DEVICE + '/power',
			status: { initial: false },
			nominal: { initial: false },
			initial: false,
			timeout: 5000,
			freq: .1,
			iv: 700,
			mode: 'simple'
		} ),

		temp: SKilnTemp( {
			topic: DEVICE + '/temp',
			status: { range: [ -20, 1300 ], initial: 18 },
			mode: 'simulate',
			iv: 1000,
			speed: .3,
			jitter: .5,
			min: 0.5,
			max: 99.7
		} ),

		lid: SBool( {
			topic: DEVICE + '/door',
			status: { initial: true },
			freq: .5,
			iv: 300,
			mode: 'simple'
		} )
	};

	return self;
}
