import Agingbuf from "#agingbuf";

import test from 'ava';

test( "Aginbuffer put und so", t => {

	var ab = Agingbuf( 3 );

	ab.put( 1 );
	t.is( ab.full(), false );

	ab.put( 2 );
	t.is( ab.full(), false );

	ab.put( 3 );
	t.is( ab.full(), true );

	t.is( ab.far(), 1 );
	t.is( ab.near(), 2 );

	ab.put( 4 );
	t.is( ab.full(), true );
	t.is( ab.far(), 2 );
	t.is( ab.near(), 3 );
} );
