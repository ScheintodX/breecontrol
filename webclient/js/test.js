require( './helpers.js' );

var Assert = require( 'chai' ).assert;

Assert.equal( (0).toTemp(), '0°' );
Assert.equal( (100).toTemp(), '100°' );
Assert.equal( (1/3).toTemp(), '0.3°' );

Assert.equal( (0).toMinSec(), '0:00' );
Assert.equal( (1).toMinSec(), '0:01' );
Assert.equal( (60).toMinSec(), '1:00' );
Assert.equal( (61).toMinSec(), '1:01' );

console.log( "DONE" );
