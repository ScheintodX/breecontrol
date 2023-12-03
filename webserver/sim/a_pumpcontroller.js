import { E } from "../E.js";
import { Mqtt as  HQ } from '../helpers.js';
import _ from "underscore";

import SBool from "./s_bool.js";


export default function APumpController( conf ) {

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

					if( Sensors.fill.status >= conf.on ) {

						self.status = true;

					} else if( Sensors.fill.status <= conf.off ) {

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
