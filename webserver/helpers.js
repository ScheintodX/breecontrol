"use strict";

function setBy( obj, topic, value, splitEx ) {

	var parts = topic.split( splitEx );

	for( var i=0; i<parts.length-1; i++ ) {

		var part = parts[ i ];

		if( !( part in obj ) ) obj[ part ] = {};

		obj = obj[ parts[ i ] ];
	}

	obj[ parts[ parts.length-1 ] ] = value;
}

module.exports = {

	message: {
		setByMqtt: function( obj, topic, value ) {
			return setBy( obj, topic, value, /\//g );
		},
		setByDot: function( obj, topic, value ) {
			return setBy( obj, topic, value, /\./g );
		}
	}
};
