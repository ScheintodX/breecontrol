import { E } from '../../E.js';

import Repl from 'repl';
import S_3steps from './3steps.js';

var _script = {
	"name": "Schrühbrand",
	"description": "Vorsichtiger Schrühbrand",
	"script": "3steps.js",
	"steps": [
		// "rate" is in °C/h, "target" in °C, "hold" in s
		{ "name": "Trocknung", "rate": 60, "heat": 160, "hold": 600 },
		{ "name": "Entbrennung", "rate": 90, "heat": 573, "hold": 900 },
		{ "name": "Sinterung", "rate": 120, "heat": 960, "hold": 900 },
		{ "name": "Abkühlung", "rate": 999, "heat": 80 }
	]
}

var _kiln = {
	name: "Karl Klammerbeutel",
	temp: {
		status: 20,
	},
	indicator: {
		_notify: function( what ) { E.cho( "Indicator " + what ) }
	},
	conf: {
		max: 1300,
		power: 18000
	},
	apply: function() {
		if( _kiln.temp.set ){
			_kiln.temp.status = _kiln.temp.set;
			delete( _kiln.temp.set );
		}
		return _kiln;
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

var _Script = S_3steps( _script, _kiln, _config, _env );

var repl = Repl.start( '> ' );
repl.context.script = _Script;
repl.context.boiler = _kiln;
repl.context.config = _config;
repl.context.env = _env;

_Script.start();
_Script.run();
_kiln.apply();

console.log( "OK" );
