"use strict";

var log = require( './logging.js' );
var HM = require( './helpers.js' ).message,
    JS = require( './helpers.js' ).json;;
var Dot = require( 'dot-object' );
var _ = require( 'underscore' );
var E = require( './E.js' );
var jdp = require( 'jsondiffpatch' );

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

		var original = JSON.parse( self.asJson() );

		f();

		var changed = JSON.parse( self.asJson() );

		return jdp.diff( original, changed );
	}

	var self = {

		boilers: boilers,

		infrastructure: {},

		clone: function() {
			return JSON.parse( JSON.stringify( this ) );
		},

		asJson: function() {

			var boilers = [];

			return JS.stringifyPublic( { boilers: self.boilers } );
		},

		// Direct access to sub fields via setByMqttMethod
		setByMqtt: function( topic, value ) {

			if( topic.match( /^infrastructure\// ) ){

				HM.setByMqtt( self, topic, value );

			} else if( topic.match( /^boiler[12]\// ) ) {

				return doSupervised( function() {

					HM.setByMqttMethod( self.boilers, topic, value );

					self.watch();
				} );


			} else {
				log.warn( "Unknown topic: " + topic );
			}
		},

		// Direct access to sub fields via setByMqttMethod
		setByWeb: function( topic, value ) {

			if( topic.match( /^boiler[12]\./ ) ){

				log.info( "SET " + topic + " " + value, typeof value );

				return doSupervised( function() {

					HM.setByWebMethod( self.boilers, topic, value );

					self.watch();
				} );
			}
		},

		watch: function() {

			for( var boiler in self.boilers ) {

				self.boilers[ boiler ].watch();
			}
		},

		// Recursive access to fields via publish/emit
		publish: function( emit ) {

			for( var boiler in self.boilers ) {

				self.boilers[ boiler ].publish( function( topic, data ) {

					//E.rr( 'emit', boiler + '/' + topic, data );
					emit( boiler + '/' + topic, data );
				} );
			}
		},

		// Recursive access to fields via subscribe/emit
		subscribe: function( emit ) {

			emit( 'infrastructure/#' );

			for( var boiler in self.boilers ) {

				self.boilers[ boiler ].subscribe( function( topic ) {

					//E.rr( 'emit', boiler + '/' + topic );
					emit( boiler + '/' + topic );
				} );
			}
		}

	};

	return self;
}
