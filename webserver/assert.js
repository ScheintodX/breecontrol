"use strict";

module.exports = {
	present: function( name, value ) {
		if( !value ) throw "'" + name + "' is missing";
	},
	default: function( value, defaultValue ) {
		if( !value ) return defaultValue;
		return value;
	}

};
