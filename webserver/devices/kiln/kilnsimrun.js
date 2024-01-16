import E from '../../E.js';

import 'colors';
import log from '../../logging.js';
import Catch from '../../catch.js';
Catch.log( log );

import KilnGen from './kilnsim.js';
import Repl from '../../repl.js';

import Mqtt from '../../mqtt.js';
var _mqtt = false;
var _publish;

var U_DAMPER_FACTOR = 10; // W/K

var Kiln = KilnGen();
E.rr( Kiln.dump( 0, 0 ) );

const MqttConfig = {
    client: "kilnsim",
    url: "mqtt://localhost:1883",
    username: "braumeister",
	password: '3oropMLRr7PvFpFEhHVijqDH',
	prefix: 'pottery/kiln/'
}
const repl = Repl( {
	Kiln: Kiln,
	Sys: Sys
} );

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

		case "speed/set":
			Sys.speed = parseInt( v );
			break;

	}
}

var last = 0;
function loop() {

	Kiln.tick( Sys.runtime, Sys.dt );
	Sys.runtime += Sys.dt;

	var now = Date.now();
	E.very( 5, Kiln.dump( Sys.runtime, Sys.speed ) );

	Kiln.pub( _publish, Sys.runtime );
}

async function startMqtt() {

	var mqtt = await Mqtt( gotMqttData, MqttConfig, x => x( "+/set" ) );

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
