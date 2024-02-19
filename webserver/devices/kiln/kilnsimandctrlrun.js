import E from '#E';
import Kiln from './kilnsim.js';
import Ctrl from './kilnctrl.js';
import Repl from '#repl';
import printf from 'printf';

const CONFIG = {
	M_KILN: 400, //kg (tuning) note here: temperature has a gradient. probably half the mass would do.
	C_KILN: 1000, // J/(kgK) (tuning)
	get Q_KILN() { return CONFIG.M_KILN * CONFIG.C_KILN /3600; }, // J/K/3600 == Wh/kg ~ 111 Wh/K
	P_MAX: 18000, // W
	T_MAX: 1400,
	get P_LOSS() { return CONFIG.P_MAX / CONFIG.T_MAX; } // W/K //estimate so the kiln reaches equilibrium at 1400°C
};

const Script = {
	name: "4 steps script test",
	steps: [
		{ name: "Trocknen",    rate: 60,  heat: 160 },
		{ name: "Entbinden",   rate: 90,  heat: 553 },
		{ name: "Quarzsprung", rate: 30,  heat: 593 },
		{ name: "Schrühen",    rate: 150, heat: 960, hold: 30 },
		{ name: "Abkühlen",    rate: -40,  heat: 80 },
	]
};

const mins = (m) => m*60,
       hrs = (h) => h*60*60;

var sys = {
	t: 0,
	get T() {
		return kiln.T_temp;
	},
	get fac() {
		return kiln.powerfactor;
	},
	step: 0
};

function emit( topic, value ) {
	if( topic == "powerfactor" ) kiln.powerfactor = value;
	if( topic == "rate" ) sys.rate = value;
	else if( topic == "step" ) sys.step = value;
}

var ctrl = Ctrl( CONFIG, emit );
var kiln = Kiln({
	m_mass: CONFIG.M_KILN,
	u_loss: CONFIG.P_LOSS,
	flag_use_pwm_for_power: false
	//...
});

const repl = Repl( {
	kiln: kiln,
	ctrl: ctrl,
	sys: sys
} );

function sleep( ms ){
	return new Promise( ( resolve )=>{
		setTimeout( resolve, ms );
	} );
}

function s2time( s ){
	var h,m,s;
	h = s/3600|0;
	s = s - h*3600;
	m = s/60|0;
	s = s - m*60;
	return printf( "%02d:%02d:02d", h, m, s );
}

async function main(){

	ctrl.load( Script );
	ctrl.start();

	kiln.system = true;

	var i, lastT, divT, Tph;
	const minsT = 15;
	console.log();
	for( i=0; i<=hrs(24); i++ ){

		ctrl.tick( sys.t, sys.T);
		kiln.tick( sys.t, 1 );

		if( ( sys.t%mins( minsT )) == 0 ){

			divT = sys.T - lastT;
			divT = divT < 0 ? -divT : divT;
			Tph = divT / minsT * 60;
			lastT = sys.T;
			console.log( printf( "%s % 14s % 6.2f %s % 6.1f/% 6.1f %s % 6.1f %s",
					s2time( sys.t ), sys.step,
					kiln.powerfactor.toFixed(3), E.bar( kiln.powerfactor, 20 ),
					Tph, sys.rate, E.bar( Tph/200, 20 ),
					sys.T, E.bar( sys.T/1300, 100 ) )
			);
		}

		while( sys.step <= 0 ){
			await sleep( 100 );
		}
		sys.step--;
		sys.t++;
	}
	process.exit();
}

await main();
