"use strict";

var H = require( './helpers.js' ).mqtt;

var MESSAGES = [

	{ topic: "boiler1/jacket/upper/temp/status", type: "f", range: [ -50, 500 ], iv: 1000 },
	{ topic: "boiler1/jacket/upper/temp/nominal", value: 150, type: "f", range: [ 0, 300 ], iv: 1000 },
	{ topic: "boiler1/jacket/upper/temp/set" },

	{ topic: "boiler1/jacket/upper/power/status", type: "f", range: [ 0, 1 ], iv: 100 },
	{ topic: "boiler1/jacket/upper/power/set" },

	{ topic: "boiler1/jacket/upper/heater/status", type: "b", iv: 100 },

	//............../lower/...........

	{ topic: "boiler1/temp/status", type: "f", range: [ -50, 200 ], iv: 500 },
	{ topic: "boiler1/temp/nominal", value: 66, type: "f", range: [ 0, 100 ], iv: 500 },
	{ topic: "boiler1/temp/set" },

	{ topic: "boiler1/fill/status", type: "f", range: [ 0, 1 ], iv: 5000 },
	//{ topic: "boiler1/fill/override" },
	{ topic: "boiler1/lid/status", type: "b", iv: 300 },
	//{ topic: "boiler1/lid/override" },

	{ topic: "boiler1/aggitator/status", type: "b", iv: 700 },
	{ topic: "boiler1/aggitator/set" },

	{ topic: "boiler1/spare/status", type: "b", iv: 700 },
	{ topic: "boiler1/spare/set" },

	{ topic: "boiler1/indicator/color/set" },  // 123456,abcdef,012912 ....
	{ topic: "boiler1/indicator/mode/set" },   // off | on | rotate | alarm
];

/*
 * Create /lower/
 */
for( var i=0; i < MESSAGES.length; i++ ) {

	var msg = MESSAGES[ i ];

	if( msg.topic.indexOf( "/upper/" ) >= 0 ) {
		MESSAGES.push( { topic: msg.topic.replace( "/upper/", "/lower/" ), type: msg.type, range: msg.range, iv: msg.iv } );
	}
}

/*
 * Create index
 */
for( var i=0; i < MESSAGES.length; i++ ) {

	var msg = MESSAGES[ i ];

	H.setByTopic( MESSAGES, msg.topic, msg );
	MESSAGES[ msg.topic ] = msg;
}


MESSAGES.find = function( topic ) {

	var msg = false;

	for( var i=0; i<MESSAGES.length; i++ ) {

		msg = MESSAGES[ i ];

		if( msg.topic == topic ) {
			return msg;
		}
	}
}

MESSAGES.info = function() {
	MESSAGES.forEach( function( msg ) {

		console.log( 'M.' + msg.topic.replace( /\//g, '.' ) + '.value' , msg.value );

	} );
}


module.exports = MESSAGES;
