import { E } from "../E.js";
import _ from "underscore";

import SFloat from "./s_float.js";


export default function SRefiller( conf ) {

	var parent = SFloat( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				if( Sensors.pump.status ) {

					self.status -= .05;

					if( self.status < Sensors.pump.conf.off )
							self.status = Sensors.pump.conf.off;

				} else {

					self.status += .01;

					if( self.status > Sensors.pump.conf.on )
							self.status = Sensors.pump.conf.on;
				}
			}

			parentRun( emit, Sensors );

		}

	} );

	return self;
}
