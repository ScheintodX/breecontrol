"use strict";

var HM = require( './helpers.js' ).message;
var Dot = require( 'dot-object' );
var _ = require( 'underscore' );
var E = require( './E.js' );

module.exports = function( boilers ) {

	function diff( orig, changed ) {

		var result = {};
		var keys = _.union( _.keys( orig ), _.keys( changed ) );

		_.each( keys, function( key ){

			if( !( key in orig ) ){
				result[ key ] = changed[ key ];
			} else if( orig[ key ] !== changed[ key ] ) {
				result[ key ] = changed[ key ];
			} else if( !( key in changed ) ){
				result[ key ] = null;
			}
		} );

		return result;
	}

	function doSupervised( f ) {

		var original = Dot.dot( self.boilers );

		f();

		var changed = Dot.dot( self.boilers );

		var d = diff( original, changed );

		return d;
	}

	var self = {

		boilers: boilers,

		infrastructure: {},

		clone: function() {
			return JSON.parse( JSON.stringify( this ) );
		},

		asJson: function() {
			return JSON.stringify( { boilers: self.boilers }, function( key, val ) {
			
				return key.startsWith( '_' ) ? undefined : val;
			} );
		},

		setByMqtt: function( topic, value ) {

			if( topic.match( /^infrastructure\// ) ){

				HM.setByMqtt( self, topic, value );

			} else if( topic.match( /^boiler[12]\// ) ) {

				if( topic.match( /override/ ) ) E.rr( topic, value );

				HM.setByMqttAutotype( self.boilers, topic, value );

			} else {
				log.warn( "Unknown topic: " + topic );
			}
		},

		setByWeb: function( topic, value ) {

			if( topic.match( /^boiler[12]\./ ) ){

				E.rr( "SET " + topic + " " + value, typeof value );

				HM.setByDot( self.boilers, topic, value );
			}
		},

		watch: function() {

			return doSupervised( function() {

				for( var boiler in self.boilers ) {

					self.boilers[ boiler ].watch();
				}
			} );
		},

		publish: function( emit ) {

			for( var boiler in self.boilers ) {

				self.boilers[ boiler ].publish( emit );
			}
		}

	};

	return self;
}
