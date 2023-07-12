import 'colors';

function stack( depth ) {

	try {
		throw Error( 'stack' );
	} catch( err ) {
		var line = err.stack.split('\n')[ depth ].trim();

		line = line.replace( /^at /, '' );
		line = line.replace( /\/.*\/(.*.js)/g, '$1' );

		return line;
	}
}

export const E = {

	rr: function(){

		var args = Array.prototype.slice.call( arguments ); //clone

		args.unshift( stack( 4 ).red );

		console.log.apply( console, args );
	},

	cho: function(){

		var args = Array.prototype.slice.call( arguments ); //clone

		args.unshift( stack( 4 ).green );

		console.log.apply( console, args );
	}

};
