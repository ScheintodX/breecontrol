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
    _speed: 1,
	set speed( val ){
		this._speed = val;
		reschedule();
	},
	get speed(){
		return this._speed;
	}
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

var Ringbuf = ( max, slice=-1 ) => {

	var data = new Array( max ).fill( 0 ),
		idx = 0;

	return {

		put: function( val ){
			data[ idx ] = val;
			idx = (idx+1)%max;
		},

		avg: function(){
			var sum=0;
			for( var i=0; i<slice; i++ ){
				sum += data[ (idx+i+max)%max ];
			}
			return sum/slice;
		},

		diff: function(){
			return data[ (idx-1+max) % max ] - data[ idx ];
		}

	};
}

const P_max = 18000, //W
      T_max = 1400, // for loss calculations
	  U_loss = P_max / T_max // ~12.9 W/K
      ;
	// P_loss == P_max
	// U_loss * T_max == P_max

var Kiln = {

	system: false,
	P_max: P_max,
	U_loss: U_loss, // W/K
	U_damper: 0, // W/K
	m_mass: 400, //kg,
	m_extra: 0,
	c_spec_heat_capacity: 840, //kWh/(kg*K)
	Q_heat: 0, //kWh
	P_heater: 0, //W
	i_damper: 0, // 0-4
	P_damper: 0, // W/K

	get T_temp() {
		return _T( this.c_spec_heat_capacity, (this.m_mass+this.m_extra), kWh2J( this.Q_heat/1000 ) );
	}, //K
	set T_temp( T ){
		this.Q_heat = J2kWh( _Q( this.c_spec_heat_capacity, (this.m_mass+this.m_extra), T ) )*1000;
	},

	get powerfactor(){
		return this.P_heater / P_max;
	},
	set powerfactor( val ){
		this.P_heater = P_max * val;
	},

	Q_buf: Ringbuf( 60, 10 ), // 1min delay, 10s avg
	T_buf: Ringbuf( 60 ),

	tick: function( dt ){

		var P_loss = this.U_loss * this.T_temp,
			Q_loss = P_loss * dt / 3600;
		var P_damper = this.U_damper * this.T_temp,
		    Q_damper = P_damper * dt / 3600;

		//var Q_heat = this.system ? this.P_heater * dt / 3600 : 0;

		var fac = ( Kiln.P_heater / P_max ),
		    h1 = pwm( 0, Sys.runtime, fac );
		var Q_heat = this.system && h1 ? this.P_max * dt / 3600 : 0;

		this.Q_heat += Q_heat;
		this.Q_heat -= Q_loss;
		this.Q_heat -= Q_damper;

		this.P_loss = P_loss + P_damper;

		this.info = `${Q_heat/1000}kWh - ${Q_loss/1000}kWh - ${Q_damper/1000}kWh`;

		this.Q_buf.put( this.Q_heat );
		this.T_buf.put( this.T_temp );
	},

	dump: function(){
		return {
			X: this.system,
			s: Sys.speed + " ticks/s",
			x: (Sys.runtime/60.0).toFixed(0) + ":" + (Sys.runtime%60) + " min",
			P: this.P_heater + " W",
			L: this.P_loss + " W",
			H: (this.powerfactor * 100 ).toFixed(0) + " %",
			U: this.U_loss.toFixed(2) + " W/K",
			d: this.i_damper,
			D: this.U_damper + " W/K",
			m: (this.m_mass + this.m_extra) + " kg",
			c: this.c_spec_heat_capacity + " J/(kg*K)",
			Q: (this.Q_buf.avg()/1000).toFixed(2) + " kWh",
			T: "=[ " + this.T_temp.toFixed(2) + " ]= °C",
			R: (this.T_buf.diff()*60).toFixed(1) + " °C/h",
			i: this.info
		};
	},

	pub: function( p ){

		p( "runtime", "" + Sys.runtime );
		p( "system/status", Kiln.system ? "1" : "0" );
		p( "temp/status", "" + (Kiln.T_temp+TEMP_OFFSET).toFixed( 1 ) );
		p( "damper/status", Kiln.i_damper.toFixed( 1 ) );

		var fac = ( Kiln.P_heater / P_max );
		p( "powerfactor/status", "" + fac.toFixed( 3 )  );

		// Just for lols
		var h1 = pwm( 0, Sys.runtime, fac );
		p( "heater/status", Kiln.system ? h2s( h1 ) : 0 );//+ h2s( h2 ) + h2s( h3 ) );
	}
};

Kiln.T_temp = 0;
E.cho( Kiln.dump() );

const repl = Repl( {
	Kiln: Kiln,
	Sys: Sys
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
