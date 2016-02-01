"use strict";

var BAG = BAG || {};

BAG.Load = (function($){

	var self = {

		load: function( name, done ) {

			if( name in BAG ) return done( null, BAG[name] );

			$.getScript( name.toLowerCase() + ".js" )
				.done( function(){ done( null, BAG[name] ); } )
				.fail( done )
				;
		},

		loader: function( name ) {
			return function( done ){
				self.load( name, done );
			}
		},

		loadScript: function( name, done ) {

			async.parallel( [
					self.loader( name + "_controls.js" ),
					self.loader( name + "_chart.js" )
			], done );
		}
	};

	return self;

})($);
