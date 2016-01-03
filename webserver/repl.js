var repl = require('repl')
var net = require('net')

module.exports = function( context, port ) {

	var r;

	function addContext( context ) {
		for( key in context ) {
			r.context[ key ] = context[ key ];
		}
	}

	if( port ) {

		net.createServer( function( socket ) {
			console.log( "start" );
			r = repl.start( {
				prompt: '[' + process.pid + '] ' +socket.remoteAddress+':'+socket.remotePort+'> ',
				input: socket,
				output: socket,
				terminal: true,
				useGlobal: false
			});
			addContext( context );
			r.on('exit', function () {
				socket.end()
			})
		}).listen( port );
	} else {

		r = repl.start( {
			prompt: '[' + process.pid + '] >',
			terminal: true,
			useGlobal: false
		} );

		addContext( context );
		
	}

	r.addContext = addContext;

	return r;
};
