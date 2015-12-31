var BAG_Usability = (function($){

	var _INST_ = {
		'input.temp': {
			min: '0', max: '100', step: '1'
		},
		'input.fill': {
			min: '0', max: '100', step: '10'
		},
		'input.time': {
			min: '0', step: '5'
		}
	}

	return function( $elem ) {

		for( key in _INST_ ) {

			$elem.find( key ).attr( _INST_[ key ] );
		}
	};

})($);
