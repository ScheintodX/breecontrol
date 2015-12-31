"use strict";

module.exports = {

	mqtt: {

		setByTopic: function( obj, topic, value ) {

			var parts = topic.split( '/' );

			for( var i=0; i<parts.length-1; i++ ) {

				var part = parts[ i ];

				if( !( part in obj ) ) obj[ part ] = {};

				obj = obj[ parts[ i ] ];
			}

			obj[ parts[ parts.length-1 ] ] = value;
		}
	}
};
