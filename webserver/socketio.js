"use strict";

var IO = require( 'socket.io' );

var log = require( './logging.js' );

var _onData = false;

var _data = false,
	_config = false
	;

module.exports = function( onData, config, data, done ) {

	Assert.present( 'onData', onData );
	Assert.present( 'config', config );
	Assert.present( 'data', data );
	Assert.present( 'done', done );

	log.trace( "Websocket starting" );

	_onData = onData;

	_config = config;
	_data = data;

	io.on( 'connection', onConnection )
	  .on( 'disconnect', onDisconnect )
	  ;


};
