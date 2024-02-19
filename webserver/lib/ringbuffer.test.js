import Ringbuf from "#ringbuf";

import test from 'ava';

test( "Rinbuffer access", t => {

	var r = Ringbuf( 10, 2, 2 ),
	    i;

	for( i=0; i<20; i+=2 ){
		r.put( i );
	}

	for( i=0; i<10; i++ ){
		t.is( r.get( i ), i*2 );
	}

	t.is( r.avg(), 1 );
	t.is( r.avg_near(), 5 );

	r.put( 20 );
	t.is( r.avg(), 3 );
	t.is( r.avg_near(), 7 );

} );
