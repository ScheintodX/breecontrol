import E from '#E';

import Repl from 'repl';
import S_5steps from './5steps.js';


var _script = {
	"name": "Brauers Delight",
	"script": "5steps.js",
	"version": 1,
	"steps": [
		{ "heat": 70.0 },
		{ "heat": 60.0, "hold": 3600 },
		{ "heat": 82.0, "hold": 3600 },
		{ "heat": 90, "hold": 1800 },
		{ "heat": 100.0 }
	]
};
var _boiler = {
	name: "Tante Testtube",
	temp: {
		status: 20,
	},
	indicator: {
		_notify: function( what ) { E.cho( "Indicator " + what ) }
	},
	conf: {
		capacity: 80,
		power: 9,
		efficency: .8
	},
	apply: function() {
		if( _boiler.temp.set ){
			_boiler.temp.status = _boiler.temp.set;
			delete( _boiler.temp.set );
		}
		return _boiler;
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

var _Script = S_5steps( _script, _boiler, _config, _env );

var repl = Repl.start( '> ' );
repl.context.script = _Script;
repl.context.boiler = _boiler;
repl.context.config = _config;
repl.context.env = _env;

_Script.start();
_Script.run();
_boiler.apply();

console.log( "OK" );
