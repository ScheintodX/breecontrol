import { amIAlpha } from '#helpers';

export default function Ringbuf( max, slice=-1, near=-1 ){

	var _data = new Array( max ).fill( 0 ),
		_idx = 0,
		_cnt = 0;

	return {

		put: function( val ){
			_data[ _idx ] = val;
			_idx = (_idx+1)%max;
			_cnt++;
		},

		avg: function( accessor = a=>a ){
			var sum=0, val, i;
			for( i=0; i<slice; i++ ){
				val = accessor( _data[ (_idx+i+max)%max ] );
				sum += val;
			}
			return sum/slice;
		},

		avg_near: function( accessor = a=>a ){
			var sum=0, val, i;
			for( i=0; i<slice; i++ ){
				val = accessor( _data[ (_idx+i+max+(max-near))%max ] );
				sum += val;
			}
			return sum/slice;
		},

		diff: function( accessor = a=>a ){

			return this.avg_near( accessor ) - this.avg( accessor );
		},

		get: function( i ){
			return _data[ (_idx+i)%max ];
		},

		dump: function() {
			var r="[ ";
			for( var i=0; i<max; i++ ){
				if( i>0 ) r += ", "
				//r += _data[ (_idx+i)%max ];
				r += _data[ i ];
			}
			return r+" ](" + _idx + "){" + this.avg() + "}";
		},

		clear: function(){
			_idx=0;
			_data.fill( 0 );
		}
	};
}
