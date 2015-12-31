var repl = require('repl')
var net = require('net')

module.exports = function( context ) {
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
		r.on('exit', function () {
			socket.end()
		})
		r.context.socket = socket
		r.context.hello = function() {
			return "World!";
		};
		for( key in context ) {
			r.context[ key ] = context[ key ];
		}
	}).listen(1337);

	return r;
};
