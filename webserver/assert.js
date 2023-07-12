export const Assert = {

	present: function( name, value ) {
		if( typeof value == 'undefined' ) throw new Error( "'" + name + "' is missing" );
	},
	default: function( value, defaultValue ) {
		if( !value ) return defaultValue;
		return value;
	}

};
