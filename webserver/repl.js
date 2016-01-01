var repl = require('repl')
var net = require('net')

module.exports = function( context, port ) {

	if( port ) {

		var r;
		net.createServer( function( socket ) {
			console.log( "start" );
			r = repl.start( {
				prompt: '[' + process.pid + '] ' +socket.remoteAddress+':'+socket.remotePort+'> ',
				input: socket,
				output: socket,
				terminal: true,
				useGlobal: false
			});
			for( key in context ) {
				r.context[ key ] = context[ key ];
			}
			r.on('exit', function () {
				socket.end()
			})
		}).listen( port );
	} else {

		var r = repl.start( {
			prompt: '[' + process.pid + '] >',
			terminal: true,
			useGlobal: false
		} );

		for( key in context ) {
			r.context[ key ] = context[ key ];
		}
		
	}

	return r;
};
