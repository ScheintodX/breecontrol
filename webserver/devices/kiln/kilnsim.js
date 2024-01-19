/*
 * Standalone Kiln simulator.
 * To be used elsewhere
 */

import E from '#E';
import _ from 'underscore';
import Ringbuf from '#ringbuf';

var PWM_PERIODE = 10;
var TEMP_OFFSET = 20;

const Jconst = 3.6e6,
      C2K = c => c+273.15,
      K2C = k => k-273.15,
      J2kWh = Q => Q/Jconst,
      kWh2J = Q => Q*Jconst
	  ;

const _Q = ( c, m, T ) => c * m * T,
      _T = ( c, m, Q ) => Q / ( c * m );

function pwm( phase, t, fac ) {

	var offset = (PWM_PERIODE/3*phase),
	    width = fac*PWM_PERIODE,
	    result = (t+offset)%PWM_PERIODE < width;

	return result;
}

function h2s( val ) {
	return val ? "1" : "0";
}


const P_max = 18000, //W
      T_max = 1400, // for loss calculations
	  U_loss = P_max / T_max // ~12.9 W/K
      ;
	// P_loss == P_max
	// U_loss * T_max == P_max

export default function Kiln( config={} ) {

	var self = _.extend( {

		system: false,
		flag_use_pwm_for_power: true,
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

		tick: function( runtime, dt ){

			// console.log( "kiln tick>", runtime, dt );

			var P_loss = this.U_loss * this.T_temp,
				Q_loss = P_loss * dt / 3600;
			var P_damper = this.U_damper * this.T_temp,
				Q_damper = P_damper * dt / 3600;

			var Q_heat;
			if( this.flag_use_pwm_for_power ){

				var fac = ( Kiln.P_heater / P_max ),
					h1 = pwm( 0, runtime, fac );

				Q_heat = this.system && h1 ? this.P_max * dt / 3600 : 0;
			} else {
				Q_heat = this.system ? this.P_heater * dt / 3600 : 0;
			}

			this.Q_heat += Q_heat;
			this.Q_heat -= Q_loss;
			this.Q_heat -= Q_damper;

			this.P_loss = P_loss + P_damper;

			this.info = `${(Q_heat/1000).toFixed(3)}kWh - ${(Q_loss/1000).toFixed(3)}kWh - ${(Q_damper/1000).toFixed(3)}kWh`;

			this.Q_buf.put( this.Q_heat );
			this.T_buf.put( this.T_temp );
		},

		dump: function( runtime, speed ){

			return {
				X: this.system,
				s: speed + " ticks/s",
				x: (runtime/60.0).toFixed(0) + ":" + (runtime%60) + " min",
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

		pub: function( p, runtime ){

			p( "runtime", "" + runtime );
			p( "system/status", this.system ? "1" : "0" );
			p( "temp/status", "" + (this.T_temp+TEMP_OFFSET).toFixed( 1 ) );
			p( "damper/status", this.i_damper.toFixed( 1 ) );

			var fac = ( this.P_heater / P_max );
			p( "powerfactor/status", "" + fac.toFixed( 3 )  );

			// Just for lols
			var h1 = pwm( 0, runtime, fac );
			p( "heater/status", this.system ? h2s( h1 ) : 0 );//+ h2s( h2 ) + h2s( h3 ) );
		}
	}, config );

	self.T_temp = 0;

	return self;
}
