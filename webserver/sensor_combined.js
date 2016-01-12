"use strict";
var E = require( './E.js' );
var _ = require( 'underscore' );

module.exports = function( conf, sensors ) {

	if( arguments.length == 1 ){
		sensors = conf;
		conf = {};
	}

	var self = Object.assign( 
		sensors,
		{
			_conf: conf,

			publish: function( emit ) {

				for( var key in self ) {

					if( key.startsWith( '_' ) ) continue;

					var sensor = self[ key ];
					if( typeof sensor != 'object' ) continue;
					if( !( 'publish' in sensor ) ) continue;

					sensor.publish( function( topic, data ) {
						emit( key + '/' + topic, data );
					} );
				}
			},

			subscribe: function( emit ) {

				for( var key in self ) {

					if( key.startsWith( '_' ) ) continue;

					var sensor = self[ key ];
					if( typeof sensor != 'object' ) continue;
					if( !( 'subscribe' in sensor ) ) continue;

					sensor.subscribe( function( topic ){
						emit( key + '/' + topic );
					} )
				}
			}
			
		}
	);

	return self;
}
