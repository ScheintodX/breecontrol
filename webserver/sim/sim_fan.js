import './patch.js';
import E from "../E.js";
import _ from "underscore";

import AOnOffAuto from './a_onoffauto.js';
import AFanController from './a_fancontroller.js';
import STempHum from './s_temphum.js';


export default function SimFan( DEVICE ) {

	var self = {

		_conf: {
			device: DEVICE,
			subscriptions: [
				DEVICE + '/fan/mode/set'
			]
		},

		fan: AFanController( {
			topic: DEVICE + '/fan/on',
			status: { initial: false },
			freq: .5,
			iv: 300,
			mode: 'simulate',
			offset: 5, //g/m²,
			hysteresis: 2 //g/m²
		} ),

		mode: AOnOffAuto( {
			topic: DEVICE + '/fan/mode',
			status: { initial: 'off' },
			initial: 'off',
			timeout: 5000,
			freq: .1,
			iv: 700,
			mode: 'simulate'
		} ),

		indoor: STempHum( {
			iv: 2000,
			mode: 'simulate',
			where: 'indoor',
			temp: {
				topic: DEVICE + '/indoor/temp',
				status: { range: [ 0, 30 ], initial: 20 },
				iv: 2000,
				mode: 'simple'
			},
			humidity_rel: {
				topic: DEVICE + '/indoor/humidity_rel',
				status: { range: [ 0, 100 ], initial: 80 },
				iv: 2000,
				mode: 'simple'
			},
			humidity_abs: {
				topic: DEVICE + '/indoor/humidity_abs',
				status: { range: [ 0, 50 ], initial: 0 },
				iv: 2000,
				mode: 'simple'
			}
		} ),

		outdoor: STempHum( {
			iv: 2000,
			mode: 'simulate',
			where: 'outdoor',
			temp: {
				topic: DEVICE + '/outdoor/temp',
				status: { range: [ 0, 40 ], initial: 25 },
				iv: 2000,
				mode: 'simple'
			},
			humidity_rel: {
				topic: DEVICE + '/outdoor/humidity_rel',
				status: { range: [ 0, 100 ], initial: 60 },
				iv: 2000,
				mode: 'simple'
			},
			humidity_abs: {
				topic: DEVICE + '/outdoor/humidity_abs',
				status: { range: [ 0, 50 ], initial: 0 },
				iv: 2000,
				mode: 'simple'
			}
		} )
	}

	return self;
}
