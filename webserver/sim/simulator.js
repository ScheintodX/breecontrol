#!/usr/bin/nodejs

import util from 'util';

import E from '../E.js';
import './patch.js';

import Config from '../config.js';
var _config;

import mqtt from 'mqtt';
var _mqttClient;

import log from '../logging.js';
log.file( '/var/log/braumeister/braumeister.test' );

import Boiler from './sim_boiler.js';
import Gloggmaker from './sim_gloggmaker.js';
import Chiller from './sim_chiller.js';
import Fan from './sim_fan.js';
import Pump from './sim_pump.js';
import Kiln from './sim_kiln.js';

var Devices = {
	kiln1: Kiln( 'kiln1' ),
	//boiler1: Boiler( 'boiler1' ),
	//boiler2: Boiler( 'boiler2' ),
	//gloggmaker1: Gloggmaker( 'gloggmaker1' ),
	//chiller1: Chiller( 'chiller1' ),
	//fan1: Fan( 'fan1' ),
	//pump1: Pump( 'pump1' )
};

import Repl from '../repl.js';
var repl = Repl( Devices );

function emit( topic, data ) {

	_mqttClient.publish( _config.mqtt.prefix + topic, data );
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

	E.rr( ex.stack );
	E.rr( util.inspect( Devices, {showHidden:false, depth: null} ) );
} );

log.info( "start mqtt test" );

function onConnect() {

	for( var dev in Devices ) {

		var device = Devices[ dev ],
			subs = device._conf.subscriptions
			;

		for( var i=0; i<subs.length; i++ ) {

			_mqttClient.subscribe( _config.mqtt.prefix + subs[ i ] );
		}
	}

	E.cho( "MQTT STARTED" );

	startDevices();
}

function onMessage( topic, data ) {

	var message = data.toString();

	if( ! topic.startsWith( _config.mqtt.prefix ) ) {
		E.rr( "wrong prefix in: " + topic );
	}

	// remove Griessbraeu
	topic = topic.slice( _config.mqtt.prefix.length );

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

async function main(){

	const config = await Config();
	_config = config;

	var mqttClient = mqtt.connect( config.mqtt.url, {
		username: config.mqtt.username,
		password: config.mqtt.password
	} )
			.on( 'connect', onConnect )
			.on( 'message', onMessage )
			;

	_mqttClient = mqttClient;

	repl.addContext( { mqtt: mqttClient, config: config } );
}

main();
