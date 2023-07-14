import { E } from "../E.js";
import { Mqtt as  HQ } from '../helpers.js';
import _ from "underscore";


export default function SFloat( conf ) {

	var r = conf.status.range;

	var self = {

		conf: conf,

		status: conf.status.initial,

		_genStatus: function( oldStatus ) {
			var rnd = Math.random() * ( r[1]-r[0]) + r[0];
			return ( 4*oldStatus + rnd ) / 5;
		},

		run: function( emit ) {

			if( conf.mode == 'random' ) {
				self.status = self._genStatus( self.status );
			}

			var asString = HQ.toString( self.status, 'f', 'scale' in conf.status ? conf.status.scale : 1 );

			if( ! conf.disabled ) emit( conf.topic + '/status', asString );
		}
	}
	return self;
}
