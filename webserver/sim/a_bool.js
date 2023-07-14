import { E } from "../E.js";
import { Mqtt as HQ } from "../helpers.js";
import _ from "underscore";

import SBool from "./s_bool.js";


export default function ABool( conf ) {

	var parent = SBool( conf ),
		parentRun = parent.run
		;

	var self = _.extend( parent, {

		nominal: false,

		run: function( emit ) {

			if( conf.mode == 'random' ) {
				self.nominal = self._genStatus( self.nominal );
			} 
			if( conf.mode == 'simulate' && self.nominal ) {
				if( !self._last || new Date() - self._last > conf.timeout ) {
					E.rr( "power off " + conf.topic + " due to missing messages" );
					self.nominal = false;
				}
			}
			if( ! conf.disabled ) emit( conf.topic + '/nominal', HQ.toString( self.nominal, 'b' ) );

			parentRun( emit );

			// Some delay from nominal to status
			if( ! conf.random ) {
				if( self.status != self.nominal ) {
					self.status = self.nominal;
				}
			}
		},

		msg: function( emit, topic, data ) {

			if( topic.match( /\/set$/ ) ){

				self._last = new Date();

				if( self.check( topic, data ) ){
					self.nominal = HQ.fromString( data, 'b' );
				}
			}
		},

		check: function( topic, val ) {

			if( !( val in ['0','1'] ) ) {
				E.rr( "Wrong val: " + val + " in " + topic )
				return false;
			}
			return true;
		}

	} );

	return self;
}
