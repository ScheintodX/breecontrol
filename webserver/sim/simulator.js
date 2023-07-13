#!/usr/bin/nodejs

import util from 'util';

import { E } from '../E.js';
import './patch.js';

import Config from '../config.js';

import mqtt from 'mqtt';

import { log } from '../logging.js';
log.file( '/var/log/braumeister/braumeister.test' );

import Boiler from './sim_boiler';
import Gloggmaker from './sim_gloggmaker';
import Chiller from './sim_chiller';
import Fan from './sim_fan';
import Pump from './sim_pump';

var Devices = {
	boiler1: Boiler( 'boiler1' ),
	//boiler2: Boiler( 'boiler2' ),
	//gloggmaker1: Gloggmaker( 'gloggmaker1' ),
	//chiller1: Chiller( 'chiller1' ),
	fan1: Fan( 'fan1' ),
	pump1: Pump( 'pump1' )
};

import Repl from '../repl.js';
var repl = Repl( Devices );

function emit( topic, data ) {

	mqttClient.publish( config.mqtt.prefix + topic, data );
}

function run( sensor, device ) {

	return function() {
		sensor.run( emit, device );
	}
}

function startDevices() {

	for( var dev in Devices ) {

		var device = Devices[ dev ];

		for( var key in device ) {

			if( key == '_conf' ) continue;

			var sensor = device[ key ];

			E.cho( key );
			E.cho( "Starting " + device._conf.device + "/" + key + "(" + sensor.conf.iv + ")..." );

			setInterval( run( sensor, device ), sensor.conf.iv );
		}
	}
	E.cho( "Devices started" );
}

process.on( 'uncaughtException', function( ex ) {

	console.log( util.inspect( Devices, {showHidden:false, depth: null} ) );
	console.log( ex.stack );
} );

log.info( "start mqtt test" );

function onConnect() {

	for( var dev in Devices ) {

		var device = Devices[ dev ],
			subs = device._conf.subscriptions
			;

		for( var i=0; i<subs.length; i++ ) {

			mqttClient.subscribe( config.mqtt.prefix + subs[ i ] );
		}
	}

	E.cho( "MQTT STARTED" );

	startDevices();
}

function onMessage( topic, data ) {

	var message = data.toString();

	if( ! topic.startsWith( config.mqtt.prefix ) ) {
		E.rr( "wrong prefix in: " + topic );
	}

	// remove Griessbraeu
	topic = topic.slice( config.mqtt.prefix.length );

	for( var dev in Devices ) {

		var device = Devices[ dev ];

		for( var key in device ) {

			if( key.startsWith( '_' ) ) continue;

			var sensor = device[ key ];

			if( sensor.msg && topic.startsWith( sensor.conf.topic ) ) {
				sensor.msg( emit, topic, message );
			}
		}
	}
}

var mqttClient = mqtt.connect( config.mqtt.url, {
	username: config.mqtt.username,
	password: config.mqtt.password
} )
		.on( 'connect', onConnect )
		.on( 'message', onMessage )
		;

repl.addContext( { mqtt: mqttClient, config: config } );


async main(){

}

main();
