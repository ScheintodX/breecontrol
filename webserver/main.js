#!/usr/bin/nodejs

import 'colors';

import { log } from './logging.js';
log.file( '/var/log/braumeister/braumeister.log' );

import { E } from './E.js';

import { Catch } from './catch.js'
Catch.log( log );

import { Assert } from './assert.js';

import Repl from './repl.js';
const repl = Repl( {} );

import Ctrl from './ctrl.js';

import Config from './config.js';
import Websocket from './express.js';
import Mqtt from './mqtt.js';
import Brewery from './brewery.js';

var hello;


async function initConfig() {

	const config = await Config();

	Assert.present( 'config', config );

	hello = {
		config: {
			devices: config.devices,
		}
	}
	repl.addContext( { config: config, hello: hello } );

	log.startup( "config", "READY" );

	return config;
}

async function initBrewery( config ) {

	const brewery = await Brewery( config );

	repl.addContext( {
			brewery: brewery,
			devices: brewery.devices,
	} );

	for( const [name,device] of Object.entries( brewery.devices ) ){
		repl.addContext( name, device );
	}

	log.startup( "brewery", "READY" );

	return brewery;
}

async function startMqtt( config, ctrl, brewery ) {

	const mqtt = await Mqtt( ctrl.gotMqttData, config.mqtt, brewery.subscribe, ctrl.filter );
			
	Assert.present( 'mqtt', mqtt );

	ctrl.setMqttCom( mqtt.send );

	log.startup( "mqtt", "STARTED" );

	return mqtt;
}

async function startWebsocket( config, ctrl ) {

	const websocket = await Websocket( ctrl.gotWebData, hello, config.ws );

	Assert.present( 'websocket', websocket );

	ctrl.setWebCom( websocket.send );

	log.startup( "websockets", "STARTED" );

	return websocket;
}

async function main(){

	log.startup( "Startup...", "" );

	const config = await initConfig();
	const brewery = await initBrewery( config );

	const ctrl = await Ctrl( config, hello, brewery );
	repl.addContext( { ctrl: ctrl } );

	await Promise.all( [
		startMqtt( config, ctrl, brewery ),
		startWebsocket( config, ctrl ) ] );

	ctrl.start();

	log.startup( "Startup", "DONE" );
}


E.cho( "Startup" );
main();
