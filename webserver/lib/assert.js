import _ from 'underscore';

function AssertF( ){
	switch( arguments.length ){
		case 0: throw new Error( "What do u want master?" );
		case 1: if( ! arguments[ 0 ] ) throw new Error( "Assertion not met" );
		case 2: if( ! arguments[ 1 ] ) throw new Error( `${arguments[0]}: is not true` );
		//case 3: if( arguments[ 1 ] !== arguments[ 2 ] ) throw new Error( `${arguments[0]}: ${arguments[1]} != ${arguments[2]}` );
	}
}
const Assert = _.extend( AssertF, {

	present: function( name, value ) {
		if( !(typeof value != 'undefined')){
			throw new Error( `'${name}' is missing` );
		}
	},

	presentAll: function( names, object ) {
		for( var i=0; i<names.length; i++ ){
			if( typeof object[names[i]] == 'undefined' ){
				throw new Error( `${names[i]}' is missing` );
			}
		}
	},

	isArray: function( name, value ){
		if( !(Array.isArray( value )) ){
			throw new Error( `${name} expected to be array but is ` + (typeof value) );
		}
	},

	isObject: function( name, o ){

		if( !( o instanceof Object && o.constructor === Object ) ){
			throw new Error( `${name} expected to be object but is ${typeof value}`  );
		}
	},

	equals: function( name, actual, expected ) {
		if( !(actual === expected) ){
			throw new Error( `${name} expected: ${expected} but was: ${actual}` );
		}
	},

	default: function( value, defaultValue ) {
		if( !value ) return defaultValue;
		return value;
	}

} );

export default Assert;
