import './patch.js';
import E from "../E.js";
import _ from "underscore";

import SFloat from './s_float.js';
import AOnOffAuto from './a_onoffauto.js';
import APumpController from './a_pumpcontroller.js';
import SRefiller from './s_refiller.js';


export default function SimPump( DEVICE ) {

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
			on: .60, //%
			off: .40 //%
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
			status: { range: [ 0, 1 ], initial: .70, scale: 3 },
			iv: 1000,
			mode: 'simulate'
		} ),

		temp: SFloat( {
			topic: DEVICE + '/temp',
			status: { range: [ 0, 100 ], initial: 20 },
			iv: 2000,
			mode: 'random'
		} )
	}

	return self;
}
