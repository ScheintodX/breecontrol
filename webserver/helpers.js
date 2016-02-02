"use strict";

var Assert = require( "./assert.js" );

function splitByMqtt( topic ) {
	return topic.split( "/" );
}
function splitByWeb( topic ) {
	return topic.split( "." );
}

function getByParts( obj, parts ) {

	for( var i=0; i<parts.length; i++ ) {

		var part = parts[ i ];

		if( !( part in obj ) ) return undefined;

		obj = obj[ parts[ i ] ];
	}

	return obj;
}

function setByParts( obj, parts, value ) {

	for( var i=0; i<parts.length-1; i++ ) {

		var part = parts[ i ];

		if( !( part in obj ) ) obj[ part ] = {};

		obj = obj[ parts[ i ] ];
	}

	obj[ parts[ parts.length-1 ] ] = value;
}

function setByAutotype( obj, parts, value ){

	if( parts.length < 2 )
			throw new Error( 'Wrong topic: ' + topic );

	var key = parts.pop();
	var that = getByParts( obj, parts );

	if( !that ) throw new Error( "Obj not found for " + topic );

	if( value.length > 0 ) {
		var conf = that._conf;
		if( !conf ) throw new Error( "conf missing in " + topic );
		var type = conf.type;
		if( !type ) throw new Error( "Type missing in " + topic );
		value = fromString( value, type );

		that[ key ] = value;
	} else {
		delete that[ key ];
	}
}

function setByMqttMethod( obj, topic, value ) {

	var parts = splitByMqtt( topic );

	return setByMethod( obj, parts, value, 'setByMqtt' );

}

function setByWebMethod( obj, topic, value ) {

	var parts = splitByWeb( topic );

	return setByMethod( obj, parts, value, 'setByWeb' );

}

function setByMethod( obj, parts, value, setter ) {

	if( parts.length < 2 )
			throw new Error( 'Wrong topic: ' + topic );

	var key = parts.pop();
	var that = getByParts( obj, parts );

	if( !that ) throw new Error( "Obj not found for: " + topic );

	that[ setter ]( key, value );
}

function fromString( val, type ) {

	switch( type ) {
		case 's': return val; // No conversion needed
		case 'f': return parseFloat( val );
		case 'b': return (val == '1') ? true : false; break;
		default:
				throw new Error( "Unknown type: " + type + " for: " + val );
	}
}

function toFloatString( val, scale ) {

	if( !scale ) scale = 1;

	var fac = Math.pow( 10, scale );

	return '' + ( Math.round( val * fac ) / fac );
}

function toString( val, type, scale ) {

	if( val === null ) return "";

	switch( type ){
		case 's': return val;
		case 'f': return toFloatString( val, scale );
		case 'b': return val ? '1' : '0';
		default:
				throw new Error( "Unknown type: " + type + " for: " + val );
	}
}

function toStringAutotype( val, scale ) {

	if( val === null ) return "";

	switch( typeof val ){
		case 'string': return val;
		case 'number': return toFloatString( val, scale );
		case 'boolean': return val ? '1' : '0';
		default:
				throw new Error( "Unknown type: " + (typeof val) + " for: " + val );
	}
}

var Helpers = {

	message: {
		setByParts: setByParts,
		setByMqtt: function( obj, topic, value ) {
			return setByParts( obj, splitByMqtt( topic ), value );
		},
		setByDot: function( obj, topic, value ) {
			return setByParts( obj, splitByWeb( topic ), value );
		},
		setByAutotype: setByAutotype,
		setByMqttAutotype: function( obj, topic, value ){
			return setByAutotype( obj, splitByMqtt( topic ), value );
		},
		setByMqttMethod: setByMqttMethod,
		setByWebMethod: setByWebMethod,
		getByParts: getByParts,
		getByMqtt: function( obj, topic ) {
			return getByParts( obj, splitByMqtt( topic ) );
		},
		getByDot: function( obj, topic ) {
			return getByParts( obj, splitByWeb( topic ) );
		},
		splitByMqtt: splitByMqtt,
		splitByWeb: splitByWeb
	},
	mqtt: {
		toString: toString,
		toStringAutotype: toStringAutotype,
		fromString: fromString,
	},
	func: {
		augment: function( obj, before, after ) {

			if( typeof obj == 'function' ) {

				return function(){
					var args = Array.prototype.slice.call( arguments );
					args.unshift( obj );
					if( before ) before.apply( this, args );
					f.apply( this, arguments );
					if( after ) after.apply( this, args );
				}

			} else if( typeof obj == 'object' ) {

				for( var key in obj ) {

					if( !( typeof key == 'function' ) ) return;

					var f = obj[ key ];

					obj[ key ] = function() {

						var args = Array.prototype.slice.call( arguments );
						args.unshift( f );
						if( before ) before.apply( obj, args );
						f.apply( obj, arguments );
						if( after ) after.apply( obj, args );
					}

				}
			} else throw new Error( "Cannot augment " + (typeof obj) );
			return obj;
		},
		trace: function( func, before, after ) {
			return Helpers.func.augment( func,
					function() {
						E.rr( arguments );
					},
					function() {
						E.rr( "done" );
					}
			)

		}
	},

	json: {
		stringifyPublic: function( data, pretty ) {

			return JSON.stringify( data, function( key, val ) {
			
				return key.startsWith( '_' ) ? undefined : val;
			}, pretty ? '\t' : undefined );
		}
	}
};

module.exports = Helpers;
