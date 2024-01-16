import 'colors';

function stackid( depth = 3 ){

	return stack( depth+1, 1 );
}

function stack(numberOfLinesToRemove = 3, maxLines = -1) {

	try {
		throw new Error();
	} catch (error) {

		let stackLines = error.stack
			.split('\n')
			.slice(numberOfLinesToRemove + 1)
			.filter(line => !line.includes('node_modules'));

		if (maxLines !== -1) {
			stackLines = stackLines.slice(0, maxLines);
		}

		return stackLines.map( line => {
			let functionName = 'unknown';
			let fileName = 'unknown';

			// Check for function name and file details
			const functionMatch = line.match(/at (\S+)(?: \[as \S+\])? \(/); //line.match(/at (.+) \(/);
			if (functionMatch && functionMatch[1]) {
				functionName = functionMatch[1].trim();
			}

			const fileMatch = line.match(/\/([^\/]+:\d+):\d+/); //line.match(/\/([^\/]+:\d+)/);
			if (fileMatch && fileMatch[1]) {
				fileName = fileMatch[1].trim();
			}

			return `${functionName}[${fileName}]`;
		} ).join(' < ');
	}
}

var everylog = {}

export default {

	rr: function(){

		var args = Array.prototype.slice.call( arguments ); //clone

		args.unshift( stack( 2 ).red );

		console.log.apply( console, args );
	},

	cho: function(){

		var args = Array.prototype.slice.call( arguments ); //clone

		args.unshift( stack( 3 ).green );

		console.log.apply( console, args );
	},

	x: function(){

		var args = Array.prototype.slice.call( arguments );

		args.unshift( stack( 2, 4 ).red );

		console.log.apply( console, args );
	},

	very: function(){

		var args = Array.prototype.slice.call( arguments ),
		    now = Date.now();

		var every = args.shift() * 1000,
		    id = stackid( 2 );

		var last = everylog[ id ];
		if( !last ) {
			last = 0;
		}
		if( now-last >= every ){
			last = now;

			args.unshift( stack( 2 ).red );
			args.unshift( new Date( now ) );

			console.log.apply( console, args );
		}
		everylog[ id ] = last;
	}

};
