import E from './E.js';
import Assert from './assert.js';
import log from './logging.js';

import mqtt from 'mqtt';

// Scream server example: "hi" -> "HI!!!"

function arrayze( val ){

	if( !val ) val = [];
	if( ! Array.isArray( val ) ){
		val = [ val ];
	}
	return val;
}

export default function Mqtt( onData, config, subscribe, filter ) {

	return new Promise( (resolve, reject) => {

		Assert.present( 'onData', onData );
		Assert.present( 'config', config );

		subscribe = arrayze( subscribe );
		filter = arrayze( filter );

		log.info( "MQTT starting" );
		log.info( config.url, config.username );

		var started = false;
		var _onData = onData;

		var mqttClient = mqtt.connect( config.url, {
				clientId: config.client,
				username: config.username,
				password: config.password
		} );

		mqttClient.on( 'connect', function () {
			log.info( "MQTT Connect" );
			log.trace( arguments );
			subscribe.forEach( s => {
				s( function( topic ) {
					var t = config.prefix + topic;
					log.startup( "SUBSCRIBE", t );
					mqttClient.subscribe( t ) }
				);
			} );
			log.trace( "MQTT STARTED" );
			if( !started ){
				started = true;
				resolve( __mqtt );
			}
		});
		mqttClient.on( 'disconnect', function () {
			E.rr( "DISCo" );
		});

		mqttClient.on( 'message', function( topic, message ) {

			if( ! topic.startsWith( config.prefix ) ) {
				log.warn( 'wrong prefix in: ' + topic );
				return;
			}

			topic = topic.slice( config.prefix.length );

			for( const f of filter){
				if( f( topic, message ) ) return;
			}

			log.trace( 'Q<', topic, message.toString() );

			_onData( topic, message.toString() );
		} );

		mqttClient.on( 'error', function( err ){

			throw( err );
		});

		var __mqtt = {

			send: function( topic, data ) {

				log.trace( "Q>", topic, data );

				mqttClient.publish( config.prefix + topic, data );
			}
		};
	} );
};
