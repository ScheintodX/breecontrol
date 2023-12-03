import { E } from "../E.js";
import { Mqtt as HQ } from "../helpers.js";
import _ from "underscore";

import SBool from "./s_bool.js";


export default function AFanController( conf ) {

	var parent = SBool( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				var mode = Sensors.mode.status;

				if( mode == "on" ) {

					self.status = true;

				} else if( mode == "off" ) {

					self.status = false;

				} else if( mode == "auto" ) {

					var hum_in = Sensors.indoor.humidity_abs.status,
						hum_out = Sensors.outdoor.humidity_abs.status,
						offset = conf.offset,
						hysteresis = conf.hysteresis
						;

					if( hum_in > hum_out + offset ) {

						self.status = true;

					} else if( hum_in < hum_out + offset - hysteresis ) {

						self.status = false;
					}

				} else {

					E.rr( "Unknown mode: " + mode );
				}

				if( ! conf.disabled ) emit( conf.topic + '/status', '' + HQ.toString( self.status, 'b' ) );

			} else {
				parentRun( emit, Sensors );
			}

		}
	} );

	return self;
}
