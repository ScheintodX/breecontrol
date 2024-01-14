import { Assert } from './assert.js';
import KilnCtrl from './kilnctrl.js';


const CONFIG = {
	M_KILN: 400, //kg (tuning) note here: temperature has a gradient. probably half the mass would do.
	C_KILN: 1000, // J/(kgK) (tuning)
	get Q_KILN() { return CONFIG.M_KILN * CONFIG.C_KILN /3600; }, // J/K/3600 == Wh/kg ~ 111 Wh/K
	P_MAX: 18000, // W
	T_MAX: 1400,
	get P_LOSS() { return CONFIG.P_MAX / CONFIG.T_MAX; } // W/K //estimate so the kiln reaches equilibrium at 1400°C
};


const Script = {
	steps: [
	//                                °C/h        °C       min
		{ name: "Trocknen",    rate: 60,  heat: 160 },
		{ name: "Entbinden",   rate: 90,  heat: 553 },
		{ name: "Quarzsprung", rate: 30,  heat: 593 },
		{ name: "Schrühen",    rate: 150, heat: 960, hold: 15 },
		{ name: "Abkühlen",    rate: -30,  heat: 80 },
	]
}

var kilnctrl = KilnCtrl( CONFIG );

function bar( p, w=160 ){
	var l = Math.min( p, 1 ) *w |0;
	if( l < 0 ) return "ERR: " + l;
	return "=".repeat( l ) + ".".repeat( w-l );
}

kilnctrl._check( Script );
kilnctrl._prepare( Script );

console.log( Script );

var T, t, step, power, fac;

for( T = 0; T <= 1200; T+=10 ){
	t = T;
	step = kilnctrl._stepFor( Script, true, t, T );
	if( !step ) break;
	power = kilnctrl._powerFor( step.rate, T );
	fac = kilnctrl._power2fac( power, T );
	console.log( T, step.name, step.heat, step.rate, power.toFixed(1), fac.toFixed(3), bar( fac ) );
}

for( T; T >= 0; T-=50 ){
	t = T;
	step = kilnctrl._stepFor( Script, false, t, T );
	if( !step ) break;
	power = kilnctrl._powerFor( step.rate, T );
	fac = kilnctrl._power2fac( power, T );
	console.log( T, step.name, step.heat, step.rate, power.toFixed(1), fac.toFixed(3), bar( fac ) );
}

