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
    username: "braumeister",
	password: '3oropMLRr7PvFpFEhHVijqDH',
	prefix: 'pottery/kiln/'
}

var PWM_PERIODE = 10;
var TEMP_OFFSET = 20;

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

		case "system/set":
			var val = parseFloat( v );
			Kiln.system = !!val;
			break;

		case "powerfactor/set":
			var val = parseFloat( v );
			if( val || val === 0 ){
				Kiln.P_heater = Kiln.P_max * val;
			}
			break;

		case "heat/set":
			var val = parseFloat( v );
			if( val || val === 0 ){
				Kiln.heat=val;
			}
			break;

		case "loss/set":
			var val = parseFloat( v );
			if( val || val === 0 ){
				Kiln.U_loss = val;
			}
			break;

		case "extramass/set":
			var val = parseFloat( v );
			if( val || val === 0 ){
				Kiln.m_extra = val;
			}
			break;

		case "dt/set":
			var val = parseInt( v );
			if( val ){
				dt = val;
			}
			break;

		case "offset/set":
			var val = parseInt( v );
			if( val ){
				TEMP_OFFSET = val;
			}
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


var Buf = ( max, slice ) => {
	var res = {
		MAX: max,
		SLICE: slice,
		data: [],
		put: function( val ){
			this.data.push( val ); // to the end
			while( this.data.length > this.MAX ){
				this.data.shift(); // from the beginning
			}
		},
		get avg(){
			return this.data.slice(0,slice).reduce( (a,b) => ( a + b / this.data.length ) );
		}
	};
	for( var i=0; i<max; i++ ) res.put( 0 );
	return res;
}

var Kiln = {

	system: false,
	P_max: 18000, //kW
	U_loss: 5, // W/K
	m_mass: 400, //kg,
	m_extra: 0,
	c_spec_heat_capacity: 840, //J/(kg*K)
	Q_heat: 0, //kWh
	P_heater: 18000, //W
	get T_temp() {
		return _T( this.c_spec_heat_capacity, (this.m_mass+this.m_extra), kWh2J( this.Q_heat ) );
	}, //K
	set T_temp( T ){
		this.Q_heat = J2kWh( _Q( this.c_spec_heat_capacity, (this.m_mass+this.m_extra), T ) );
	},
	buf: Buf( 60, 10 ), // 1min delay, 10s avg
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
			X: this.system,
			U: this.U_loss + " W/K",
			m: (this.m_mass + this.m_extra) + " kg",
			c: this.c_spec_heat_capacity + " J/(kg*K)",
			q: this.Q_heat + " kWh",
			t: this.T_temp + " °C",
			T: this.buf.avg + " °C"
		} );
		//E.rr( this.buf.data.length, this.buf.data );
		//E.rr( this.buf.data.slice( -this.buf.slice ) );
	}
};
Kiln.T_temp = 0;

Kiln.dump();


function publish( t, v ){

	//E.rr( t+">", v );
	_mqtt.send( t, v );
}

function pwm( phase, time, fac ){
	var offset = (PWM_PERIODE/3*phase),
	    width = fac*PWM_PERIODE,
	    result = (time+offset)%PWM_PERIODE < width;
	return result;
}
function h2s( val ){
	return val ? "1" : "0";
}

var last = 0;
function loop(){

	Kiln.tick( dt );
	time += dt;

	var now = Date.now();
	if( now > last + 5000 ){
		Kiln.dump();
		last = now;
	}

	var fac = (Kiln.power / Kiln.P_max);

	var h1 = pwm( 0, time, fac ),
	    h2 = pwm( 1, time, fac ),
	    h3 = pwm( 2, time, fac );

	publish( "system/status", Kiln.system ? "1" : "0" );
	publish( "time", "" + time );
	publish( "temp/status", "" + (Kiln.heat+TEMP_OFFSET).toFixed( 1 ) );
	publish( "powerfactor/status", "" + fac.toFixed( 3 )  );
	publish( "powerabs/status", "" + Kiln.power.toFixed( 1 ) );
	publish( "heater/status", h2s( h1 ) + h2s( h2 ) + h2s( h3 ) );
	publish( "extramass/status", Kiln.m_extra.toFixed( 1 ) );
}

async function startMqtt() {

	var mqtt = await Mqtt( gotMqttData, config, x => x( "+/set" ) );

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
