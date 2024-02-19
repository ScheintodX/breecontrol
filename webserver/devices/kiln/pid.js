import E from '#E';
import _ from 'underscore';
import Ringbuf from '#ringbuf';


// Note: Divide into phases:
// Change - 1min - Measure 1 - 1min - Measure 2 - repeat

function Pid( config ){

	config = _.defaults( config, {

		p_weight: 1,
		t_near: 120,
		t_far: 180,
		t_avg: 60

	} );

	function P( t, factor, rate_target, rate_actual ){

		// This should result in an asymtotical aproach to
		// the desired rate.
		//
		// rate_target     factor_target
		// ------------ = ------------
		// rate_actual     factor

		var factor_target = (rate_target / rate_actual) * factor;

		// difference to current factor
		return factor_target - factor;
	}

	function I( factor, rate_target, rate_actual ){

		//var rate_error = rate_actual - rate_target;

		return 0;
	}

	function D( factor, rate_target, rate_actual ){
		return 0;
	}

	var _rate_target = 0, _factor = 0, _start = 0;
	var _t_far = Ringbuf( config.t_far, config.t_avg, config.t_near );

	var self = function( t, factor, rate_target, temperature ){

		var result, p=0, i=0, d=0;

		if( _factor != factor ){
			E.rr( "RESET" );
			_start = t;
			_t_far.clear();
			_factor = factor;
		}

		if( t-_start >= config.t_far ){

			var
				t_far = _t_far.avg( a=>a.T ),
				t_near = _t_far.avg_near( a=>a.T ),
				f = _t_var.last( a=>a.factor ),
				rate_actual = ( t_near - t_far )
			                / ( config.t_far - config.t_near )
			                * 3600,
			    p = P( t, factor, rate_target, rate_actual ),
				i = I( t, factor, rate_target, rate_actual ),
				d = D( t, factor, rate_target, rate_actual );


			result = factor + p + i + d;

			//E.rr( result, "=", t_near, t_far, rate_actual, factor, p, i, d );

		} else {
			result = factor;
		}

		_t_far.put( { T: temperature, factor: factor, rate_target: rate_target } );
		//_t_far.put( temperature );

		E.rrf( "[% 4d] %6.4f = %4.2f %4.2f/%4.2f %4.2f (%4.2f, %4.2f, %4.2f)",
			t, result, factor, rate_actual ? rate_actual : -1, rate_target, temperature,
		    p, i, d );

		return result;
	}

	// for testing
	self.P = P;

	return self;
}

export default Pid;
