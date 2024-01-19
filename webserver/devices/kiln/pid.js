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

	function P( factor, rate_target, rate_actual ){

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

		var rate_error = rate_actual - rate_target;
	}

	var _factor = 0, _start = 0;
	var _t_near = Ringbuf( config.t_near, config.t_avg ),
	    _t_far = Ringbuf( config.t_far, config.t_avg );

	var self = function( t, factor, rate_target, temperature ){

		//E.rr( t, factor, rate_target, temperature );

		var result;

		if( _factor != factor ){
			_start = t;
			_t_far.clear();
			_t_near.clear();
			_factor = factor;
		}

		_t_far.put( temperature );
		_t_near.put( temperature );

		if( t-_start >= config.t_far ){

			var rate_actual = ( _t_near.avg() - _t_far.avg() )
			                / ( config.t_far - config.t_near )
			                * 3600
			                ;

			result = factor + P( factor, rate_target, rate_actual );

		} else {
			result = factor;
		}

		E.rrf( "[% 4d] %4.2f = %4.2f %4.2f %4.2f %4.2f",
			t, result, factor, rate_target, temperature, rate_actual ? rate_actual : -1 );

		return result;
	}

	// for testing
	self.P = P;

	return self;
}

export default Pid;
