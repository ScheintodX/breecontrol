import E from "../E.js";
import _ from "underscore";

import AFloat from "./a_float.js";


function rndOf( min, max ) {

	return Math.random() * ( max-min ) + min;
}
function mix( val, factor, min, max ) {

	return ( (factor-1)*val + rndOf( min, max ) ) / factor;
}

export default function AJacketTemp( conf ) {

	var parent = AFloat( conf ),
		parentRun = parent.run;

	var self = _.extend( parent, {

		conf: conf,

		run: function( emit ) {

			parentRun( emit );
		}
	} );
	return self;
}
