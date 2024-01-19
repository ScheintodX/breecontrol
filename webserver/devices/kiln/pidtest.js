import Pid from './pid.js';

import E from '#E';

var pid = Pid( {
	t_near:10,
	t_far: 15,
	t_avg: 5
} );

var fac = .5;

var Minikiln = {
	T: 20,
	heat: function(v){ this.T += v/10; }
};

//var x = pid( 0, .5, 50, 10 );
for( var t=0; t<40; t++ ){

	Minikiln.heat( fac );

	fac = pid( t, fac, 50, Minikiln.T );
}
