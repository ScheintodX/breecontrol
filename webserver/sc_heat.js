"use strict";

var Assert = require( './assert.js' ),
    E = require( './E.js' );

function calcTime( t_src, t_dest, vol, kw, efficiency ) {

	var t_delta = t_dest - t_src;
	if( t_delta <= 0 ) return 0;

	var kcal = vol * t_delta, // kilokalorie: 1L um 1°C erwärmen
	    kwh = kcal * 0.00116222,
	    kwh_eff = kwh / efficiency,
	    kwsec_eff = kwh_eff * 3600,
	    sec = kwsec_eff / kw
	    ;

	return sec;
}

module.exports = function( args, config, env ){

	Assert.present( 'args.heat', args.heat );
	Assert.present( 'args.from', args.from );
	
	var self = {

		start: function( current, boiler ) {

			current.start = env.time();
			current.desc = 'Heat to ' + args.heat + '°C';

			boiler.temp.set = args.heat;

			E.rr( "Start heat", current.desc );
		},
		pause: function( current, boiler ) {

			boiler.temp.set = 0;
		},
		resume: function( current, boiler ) {

			boiler.temp.set = args.heat;
		},
		stop: function( current, boiler ) {

			boiler.temp.set = 0;
		},
		run: function( current, boiler ) {

			if( current.mode != 'run' ) return;

			current.elapsed = env.time() - current.start;
			current.remaining = calcTime(
					boiler.temp.status,
					args.heat,
					boiler.conf.capacity,
					boiler.conf.power,
					boiler.conf.efficency
			);

			if( boiler.temp.status >= args.heat ) {
				
				current.mode = 'done';
				E.rr( current.desc, "done" );
			}
		},
		guessRuntime: function( boiler ) {

			return calcTime( 
					args.from,
					args.heat,
					boiler.conf.capacity,
					boiler.conf.power,
					boiler.conf.efficency
			);
		}
	}
	return self;
};

