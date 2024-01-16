import E from '#E';
import Assert from '#assert';
import log from '#logging';


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

export default function( args, config, env ){

	Assert.present( 'args.heat', args.heat );
	Assert.present( 'args._from', args._from );

	var self = {

		start: function( current, boiler ) {

			current.start = env.time();
			current.desc = 'Heat to ' + args.heat + '°C';

			boiler.temp.setTo( args.heat );

			log.info( "Start heat", current.desc );
		},
		pause: function( current, boiler ) {

			boiler.temp.setTo( 0 );
		},
		resume: function( current, boiler ) {

			boiler.temp.setTo( args.heat );
		},
		stop: function( current, boiler ) {

			boiler.temp.setTo( 0 );
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

			// Todo: 1°C vor erreichen der Zieltemperatur wird abgeschalten. Der Wert sollte in irgend eine Config
			if( boiler.temp.status >= (args.heat-1.0) ) {

				current.mode = 'done';
			}
		},
		guessRuntime: function( boiler ) {

			return calcTime(
					args._from,
					args.heat,
					boiler.conf.capacity,
					boiler.conf.power,
					boiler.conf.efficency
			);
		}
	}
	return self;
};

