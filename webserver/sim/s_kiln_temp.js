import E from "../E.js";
import _ from "underscore";

import SFloat from './s_float.js';


export default function SKilnTemp( conf ) {

	var parent = SFloat( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		run: function( emit, Sensors ) {

			if( conf.mode == 'simulate' ) {

				var avgHeaters = 0,
					numHeaters = 0;

				if( Sensors.upper ){
					avgHeaters += Sensors.upper.temp.status;
					numHeaters++;
				}
				if( Sensors.lower ){
					avgHeaters += Sensors.lower.temp.status;
					numHeaters++;
				}
				if( Sensors.jacket ){
					avgHeaters += Sensors.jacket.temp.status;
					numHeaters++;
				}
				avgHeaters /= numHeaters;

				var diff = avgHeaters - self.status;

				var change;

				if( diff > 0 ) {
					change = .02*diff*conf.speed;
				} else {
					change = .01*diff*conf.speed;
				}
				self.status += change;

				if( self.status > self.conf.max ) self.status = self.conf.max;
				if( self.status < self.conf.min ) self.status = self.conf.min;

				self.status = self.status.jitter( conf.jitter );
			}

			parentRun( emit );
		}

	} );

	return self;
}
