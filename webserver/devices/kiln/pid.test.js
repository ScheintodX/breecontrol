import test from 'ava';
import Pid from './pid.js';

import E from '#E';

var pid = Pid( {
	t_near:10,
	t_far: 15,
	t_avg: 5
} );

var fac = .5;

var Minikiln = () => { return {
	T: 20,
	heat: function(v){ this.T += v/10; }
}};

const the = (t, kiln) => {
	return {
		isT: v => t.is( kiln.T, v )
	}
};

test( "Test some heat control", t => {

	var kiln = Minikiln();

	the( t, kiln ).isT( 20 );

	for( var i=0; i<40; i++ ){

		fac = pid( i, fac, 50, kiln.T );

		kiln.heat( fac );
	}

} );
