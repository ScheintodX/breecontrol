import repl from 'repl';
import net from 'net';

var _therepl;

export default function Repl( context, port ) {

	if( arguments.length == 0 ) {
		if( !_therepl ) throw "No repl here";
		return _therepl;
	}

	var r;

	function addContext( context, value ) {
		if( arguments.length == 1 ) {
			for( const key in context ) {
				r.context[ key ] = context[ key ];
			}
		} else if( arguments.length == 2 ) {

			r.context[ context ] = value;

		} else throw new Error( "Illegal Argument Exception" );
	}

	if( port ) {

		net.createServer( function( socket ) {

			console.log( "start repl server on " + port );

			r = repl.start( {
				prompt: '[' + process.pid + '] ' +socket.remoteAddress+':'+socket.remotePort+'> ',
				input: socket,
				output: socket,
				terminal: true,
				useGlobal: false
			} );
			addContext( context );
			r.on('exit', function () {
				socket.end()
			})

		} ).listen( port );

	} else {

		r = repl.start( {
			prompt: '[' + process.pid + '] >',
			terminal: true,
			useGlobal: false
		} );

		addContext( context );
	}

	r.addContext = addContext;

	var help = {};
	function addHelp( key, value ){
		help[ key ] = value;
	}
	r.addContext( { help: help } );

	r.addHelp = addHelp;

	_therepl = r;

	return r;
};
