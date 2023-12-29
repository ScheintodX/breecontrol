"use strict";

var BAG = BAG || {};

function printBAG(){

	var cm = Object.entries( BAG )
			.reduce( ( acc, [ key, value ] ) => {
				acc[key] = Boolean(value);
				return acc;
			}, {} );
	console.log( cm );
}

BAG.Load = (function(){

	var self = {

		load: function( name, done ) {

			printBAG();

			var file = "js/" + name.toLowerCase() + ".js";

			console.log( "LOAD Js", file );

			if( name in BAG ) {
				console.log( "skipped" );
				return  done( null, BAG[name] );
			}

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

			console.log( "LOAD Html", file );

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

			console.log( "LOAD Module", name );

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
