export default function Ringbuf( max, slice=-1 ){

	var _data = new Array( max ).fill( 0 ),
		_idx = 0;

	return {

		put: function( val ){
			_data[ _idx ] = val;
			_idx = (_idx+1)%max;
		},

		avg: function(){
			var sum=0;
			for( var i=0; i<slice; i++ ){
				sum += _data[ (_idx+i+max)%max ];
			}
			return sum/slice;
		},

		diff: function(){
			return _data[ (_idx-1+max) % max ] - _data[ _idx ];
		},

		clear: function(){
			_idx=0;
			_data.fill( 0 );
		}

	};
}
