#!/usr/bin/node

import 'colors';

import { E } from './E.js';
import { log } from './logging.js';
import { Catch } from './catch.js';
Catch.log( log );
import { Assert } from './assert.js';

import Mqtt from './mqtt.js';
var _mqtt = false;

const config = {
    //url: "mqtt://mqtt.flo.axon-e.de:1883",
    client: "kilnsim",
    url: "mqtt://localhost:1883",
    username: "lakai",
    password: "lakai",
    prefix: "braumeister/kiln1/"
}

var dt = 1,
    time = 0,
	speed = 1;

var loopH = null;


function reschedule(){
	if( loopH ) clearInterval( loopH );
	loopH = setInterval( loop, 1000/speed );
}

function gotMqttData( t, v ){

	log.debug( '<', t, v );

	switch( t ){

		case "power/set":
			var val = parseFloat( v );
			if( val || val === 0 ) Kiln.P_heater = val;
			break;

		case "loss/set":
			var val = parseFloat( v );
			if( val || val === 0 ) Kiln.U_loss = val;
			break;

		case "dt/set":
			var val = parseInt( v );
			if( val ) dt = val;
			break;

		case "speed/set":
			speed = parseInt( v );
			reschedule();
			break;

	}
}

const C2K = c => c+273.15,
      K2C = k => k-273.15,
      J2kWh = Q => Q/3.6e6,
      kWh2J = Q => Q*3.6e6
	  ;
const _Q = ( c, m, T ) => c * m * T,
      _T = ( c, m, Q ) => Q / ( c * m );


var Buf = {
	MAX: 60,
	data: [],
	put: function( val ){
		this.data.push( val );
		while( this.data.length > this.MAX ){
			this.data.shift();
		}
	},
	get avg(){
		return this.data.reduce( (a,b)=>a+b ) / this.data.length;
	}
}

var Kiln = {

	U_loss: 5, // W/K
	m_mass: 400, //kg,
	c_spec_heat_capacity: 840, //J/(kg*K)
	Q_heat: 0, //kWh
	P_heater: 18000, //W
	get T_temp() {
		return _T( this.c_spec_heat_capacity, this.m_mass, kWh2J( this.Q_heat ) );
	}, //K
	set T_temp( T ){
		this.Q_heat = J2kWh( _Q( this.c_spec_heat_capacity, this.m_mass, T ) );
	},
	buf: Buf,
	tick: function( dt ){

		var P_loss = this.U_loss * this.T_temp,
			Q_loss = P_loss * dt / 3600;

		var Q_heat = this.P_heater * dt / 3600;

		/*
		log.debug( {
			P_loss: P_loss + " W",
			Q_loss: Q_loss + " Wh",
			Q_heat: Q_heat + " Wh"
		} );
		*/

		this.Q_heat -= Q_loss/1000;
		this.Q_heat += Q_heat/1000;

		this.buf.put( this.Q_heat );
	},

	get heat(){
		return this.buf.avg;
	},
	get power(){
		return this.P_heater;
	},

	dump: function(){
		E.cho( {
			U: this.U_loss + " W/K",
			m: this.m_mass + " kg",
			c: this.c_spec_heat_capacity + " J/(kg*K)",
			q: this.Q_heat + " kWh",
			t: this.T_temp + " °C"
		} );
	}
};
Kiln.T_temp = 0;

Kiln.dump();


function publish( t, v ){

	//E.rr( t+">", v );
	_mqtt.send( t, v );
}

var last = 0;
function loop(){

	Kiln.tick( dt );
	time += dt;

	var now = Date.now();
	if( now > last + 5000 ){
		E.rr( "Time", new Date( time*1000 ).toISOString().slice(11, 19) );
		E.rr( "Speed", speed );
		Kiln.dump();
		last = now;
	}

	publish( "temp/status", "" + (Kiln.heat+20).toFixed( 1 ) );
	publish( "power/status", "" + Kiln.power.toFixed( 1 ) );
	publish( "time", "" + time );
}

async function startMqtt() {

	var mqtt = await Mqtt( gotMqttData, config, x => x( "+/set" ) );

	Assert.present( 'mqtt', mqtt );

	log.startup( "mqtt", "STARTED" );

	return mqtt;
}


async function main(){

	log.startup( "Main", "start all" );

	_mqtt = await startMqtt();

	reschedule();

	log.startup( "Main", "finish" );
}

main();
