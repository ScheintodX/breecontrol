var W = require( 'watchjs' );

var obj = {
	a: 123,
	b: 456
};

W.watch( obj, function( x ){
	console.log( "--", x );
} );

console.log( obj );

obj.a = 234;

console.log( obj.a );
