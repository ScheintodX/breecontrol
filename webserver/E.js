import 'colors';

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

export const E = {

	rr: function(){

		var args = Array.prototype.slice.call( arguments ); //clone

		args.unshift( stack( 3 ).red );

		console.log.apply( console, args );
	},

	cho: function(){

		var args = Array.prototype.slice.call( arguments ); //clone

		args.unshift( stack( 3 ).green );

		console.log.apply( console, args );
	},

	// E.x( 5, "fubar" )
	x: function(){
		var args = Array.prototype.slice.call( arguments );

		args.unshift( stack( 2, 3 ).red );

		console.log.apply( console, args );
	}

};
