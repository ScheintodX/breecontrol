export default function( size ) {

	if( size < 2 ) throw new Error( "Needs at least 2 elements" );

	var _data = [];

	return {

		put: val => {
			while( _data.length >= size ) _data.unshift();
			_data.push( val );
		},
		get far() {
			if( _data.length < size ) throw new Error( "not fully filled" );
			return _data[ 0 ];
		},
		get near() {
			if( _data.length < size ) throw new Error( "not fully filled" );
			return _data[ 1 ];
		},
		full: () => {
			return _data.length > size;
		}
	}

}
