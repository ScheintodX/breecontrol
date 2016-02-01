"use strict";

var BAG = BAG || {};

BAG.Load = (function($){

	var self = {

		load: function( name, done ) {

			console.trace( "LOAD", name );

			if( name in BAG ) return done( null, BAG[name] );

			var file = "js/" + name.toLowerCase() + ".js";

			$.getScript( file )
				.done( function(){ return done( null, BAG[name] ); } )
				.fail( done )
				;
		},

		loader: function( name ) {
			return function( done ){
				self.load( name, done );
			}
		},

		loadHtml: function( name, done ) {

			var file = name.toLowerCase() + ".html";

			console.trace( "LOAD", file );
			
			$.get( file )
				.done( function( data ){ return done( null, data ); } )
				.fail( done )
				;
		},

		loaderHtml: function( name ) {
			return function( done ) {
				self.loadHtml( name, done );
			}
		},

		loadModule: function( name, done ) {

			async.parallel( [
					self.loaderHtml( name ),
					self.loader( 'Script_' + name + "_Controls" ),
					self.loader( 'Script_' + name + "_Chart" )
			], function( err, result ){

				return done( err, {
					html: result[ 0 ],
					Controls: result[ 1 ],
					Chart: result[ 2 ]
				} );
			} );
		}
	};

	return self;

})($);
