export const Assert = {

	present: function( name, value ) {
		if( typeof value == 'undefined' ) throw new Error( "'" + name + "' is missing" );
	},
	presentAll: function( names, object ) {
		for( var i=0; i<names.length; i++ ){
			if( typeof object[names[i]] == 'undefined' ) throw new Error( "'" + names[i] + "' is missing" );
		}
	},
	default: function( value, defaultValue ) {
		if( !value ) return defaultValue;
		return value;
	}

};
