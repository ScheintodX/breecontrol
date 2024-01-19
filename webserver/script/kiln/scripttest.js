import E from '#E';

import Repl from 'repl';
import S_4steps from './4steps.js';

var _script = {
	"name": "Schrühbrand",
	"description": "Vorsichtiger Schrühbrand",
	"script": "4steps.js",
	"steps": [
		// "rate" is in °C/h, "target" in °C, "hold" in s
		{ "name": "Trocknung", "rate": 60, "heat": 160 },
		{ "name": "Entbrennung", "rate": 90, "heat": 553 },
		{ "name": "Quarzsprung", "rate": 30, "heat": 573 },
		{ "name": "Sinterung", "rate": 120, "heat": 960, "hold": 900 },
		{ "name": "Abkühlung", "rate": 60, "heat": 80 }
	]
}

var _kiln = {
	name: "Karl Klammerbeutel",
	temp: {
		status: 20,
	},
	conf: {
		max: 1300,
		power: 18000
	}
};
var _config = {
}
var _env = {
	time: function() {
		return (new Date().getTime()/1000)<<0;
	},
	notify: function( boiler, what, message ) {
		E.cho( boiler.name, what, message );
	}
}

var _Script = S_4steps( _script, _kiln, _config, _env );

var repl = Repl.start( '> ' );
repl.context.script = _Script;
repl.context.boiler = _kiln;
repl.context.config = _config;
repl.context.env = _env;

_Script.start();
_Script.run();
_kiln.apply();

console.log( "OK" );
