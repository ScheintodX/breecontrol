#!/usr/bin/node

import 'colors';

import { E } from './E.js';
import { log } from './logging.js';
import { Catch } from './catch.js';
Catch.log( log );
import { Assert } from './assert.js';

import Repl from './repl.js';

import Mqtt from './mqtt.js';
var _mqtt = false;
var _publish;

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
var U_DAMPER_FACTOR = 10; // W/K

var Sys = {
	dt: 1,
    runtime: 0,
    speed: 1
};

var loopH = null;


function reschedule(){
	if( loopH ) clearInterval( loopH );
	loopH = setInterval( loop, 1000/Sys.speed );
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
				Kiln.powerfactor = val;
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
				Kiln.m_extra = val/1000.0;
			}
			break;

		case "damper/set":
			var val = parseInt( v );
			if( val >= 0 && val <=4 ){
				Kiln.i_damper = val;
				Kiln.U_damper = val * U_DAMPER_FACTOR;
			}
			break;

		case "dt/set":
			var val = parseInt( v );
			if( val ){
				Sys.dt = val;
			}
			break;

		case "offset/set":
			var val = parseInt( v );
			if( val ){
				TEMP_OFFSET = val;
			}
			break;


		case "speed/set":
			Sys.speed = parseInt( v );
			reschedule();
			break;

	}
}

const Jconst = 3.6e6,
      C2K = c => c+273.15,
      K2C = k => k-273.15,
      J2kWh = Q => Q/Jconst,
      kWh2J = Q => Q*Jconst
	  ;
const _Q = ( c, m, T ) => c * m * T,
      _T = ( c, m, Q ) => Q / ( c * m );

var Buf = ( max, slice ) => {
	// Buffer with an delay.
	// aka fifo wit an average over the oldest
	//
	// [ 1 2 3 4 5 6 7 8 ] <-input
	//   \-avg-/

	var data: new Array( max ).fill( 0 );
	var res = {
		put: function( val ){
			data.push( val ); // to the end
			while( data.length > max ){
				data.shift(); // from the beginning
			}
		},
		get avg(){
			return data.slice(0,slice).reduce( (a,b) => ( a + b ) ) / data.length ) );
		}
	};
	return res;
}

var Kiln = {

	system: false,
	P_max: 18000, //kW
	U_loss: 10, // W/K
	U_damper: 0, // W/K
	m_mass: 400, //kg,
	m_extra: 0,
	c_spec_heat_capacity: 840, //J/(kg*K)
	Q_heat: 0, //kWh
	P_heater: 0, //W
	i_damper: 0, // 0-4
	P_damper: 0, // W/K

	get T_temp() {
		return _T( this.c_spec_heat_capacity, (this.m_mass+this.m_extra), kWh2J( this.Q_heat ) );
	}, //K
	set T_temp( T ){
		this.Q_heat = J2kWh( _Q( this.c_spec_heat_capacity, (this.m_mass+this.m_extra), T ) );
	},

	get powerfactor(){
		return this.P_heater / this.P_max;
	},
	set powerfactor( val ){
		this.P_heater = this.P_max * val;
	},

	buf: Buf( 60, 10 ), // 1min delay, 10s avg
	tick: function( dt ){

		var P_loss = this.U_loss * this.T_temp,
			Q_loss = P_loss * dt / 3600;
		var P_damper = this.U_damper * this.T_temp,
		    Q_damper = P_damper * dt / 3600;

		var Q_heat = this.system ? this.P_heater * dt / 3600 : 0;

		this.Q_heat += Q_heat/1000;
		this.Q_heat -= Q_loss/1000;
		this.Q_heat -= Q_damper/1000;

		this.buf.put( this.Q_heat );
	},

	get heat(){
		return this.buf.avg;
	},

	dump: function(){
		return {
			X: this.system,
			x: (Sys.runtime/60.0).toFixed(0) + ":" + (Sys.runtime%60) + " min",
			P: this.P_heater + " W",
			H: (this.powerfactor * 100 ).toFixed(0) + " %",
			U: this.U_loss + " W/K",
			D: this.U_damper + " W/K",
			m: (this.m_mass + this.m_extra) + " kg",
			c: this.c_spec_heat_capacity + " J/(kg*K)",
			Q: this.Q_heat + " kWh",
			T: this.T_temp + " °C",
			θ: this.buf.avg + " °C"
		};
	},

	pub: function( p ){


		p( "runtime", "" + Sys.runtime );
		p( "system/status", Kiln.system ? "1" : "0" );
		p( "temp/status", "" + (Kiln.heat+TEMP_OFFSET).toFixed( 1 ) );
	//	p( "powerabs/status", "" + Kiln.P_heater.toFixed( 1 ) );
	//	p( "extramass/status", Kiln.m_extra.toFixed( 1 ) );
		p( "damper/status", Kiln.i_damper.toFixed( 1 ) );
	//	p( "damperpower/status", Kiln.P_damper.toFixed( 1 ) );

		var fac = ( Kiln.P_heater / Kiln.P_max );
		p( "powerfactor/status", "" + fac.toFixed( 3 )  );

		// Just for lols
		var h1 = pwm( 0, Sys.runtime, fac );
		p( "heater/status", h2s( h1 ) );//+ h2s( h2 ) + h2s( h3 ) );
	}
};

Kiln.T_temp = 0;
E.cho( Kiln.dump() );

const repl = Repl( {
	kiln: Kiln,
	sys: Sys
} );


function pwm( phase, t, fac ) {

	var offset = (PWM_PERIODE/3*phase),
	    width = fac*PWM_PERIODE,
	    result = (t+offset)%PWM_PERIODE < width;

	return result;
}
function h2s( val ) {
	return val ? "1" : "0";
}

var last = 0;
function loop() {

	Kiln.tick( Sys.dt );
	Sys.runtime += Sys.dt;

	var now = Date.now();
	E.very( 5, Kiln.dump() );

	Kiln.pub( _publish );
}

async function startMqtt() {

	var mqtt = await Mqtt( gotMqttData, config, x => x( "+/set" ) );

	log.startup( "mqtt", "STARTED" );

	return mqtt;
}

async function startSim( publish ){

	_publish = publish;
	reschedule();
}

async function main() {

	log.startup( "Main", "start all" );

	_mqtt = await startMqtt();
	await startSim( _mqtt.send );

	log.startup( "Main", "finish" );
}

main();
