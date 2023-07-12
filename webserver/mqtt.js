import { Assert } from './assert.js';
import { log } from './logging.js';

import mqtt from 'mqtt';

// Scream server example: "hi" -> "HI!!!"

export default function Mqtt( onData, config, subscribe ) {

	return new Promise( (resolve, reject) => {

		Assert.present( 'onData', onData );
		Assert.present( 'config', config );
		Assert.present( 'subscribe', subscribe );

		log.info( "MQTT starting" );
		log.info( config.url, config.username );

		var started = false;

		var _onData = onData;

		var mqttClient = mqtt.connect( config.url, {
				clientId: "braumeister",
				username: config.username,
				password: config.password
		} );

		mqttClient.on( 'connect', function () {
			log.info( "MQTT Connect" );
			log.trace( arguments );
			subscribe( function( topic ) {
				var t = config.prefix + topic;
				log.info( "SUBSCRIBE: " + t );
				mqttClient.subscribe( t ) }
			);
			log.trace( "MQTT STARTED" );
			if( !started ){
				started = true;
				resolve( __mqtt );
			}
		});

		mqttClient.on( 'message', function( topic, message ) {

			log.info( 'MQTT <recv', topic, message.toString() );

			if( ! topic.startsWith( config.prefix ) ) {
				log.warn( 'wrong prefix in: ' + topic );
				return;
			}

			topic = topic.slice( config.prefix.length );

			_onData( topic, message.toString() );
		});

		mqttClient.on( 'error', function( err ){

			throw( err );
		});

		var __mqtt = {

			send: function( topic, data ) {

				log.trace( "MQTT send>", topic, data );

				mqttClient.publish( config.prefix + topic, data );
			}
		};
	} );
};
