#!/usr/bin/env node

function Buf( size, avgn=4 ){

	const data = Array( size ).fill( 0 );
	var pos = 0;

	return {
		put: function( val ){
			data[ pos++ % data.length ] = val;
		},
		avg: function(){
			var res=[];
			for( var n = avgn-1; n >= 0; n-- ){
				res.push( data[ (pos-n+size) % size ] );
			}
			return res;
		}
	}
}

var x = Buf( 5 );
x.put( 1 );
x.put( 2 );
x.put( 3 );
x.put( 4 );
x.put( 5 );
x.put( 6 );
x.put( 7 );

console.assert( x.avg() == [2,3,4,5], "must match" );



