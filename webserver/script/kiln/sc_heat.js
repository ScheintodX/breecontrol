import { E } from '../../E.js';
import { Assert } from '../../assert.js';
import { log } from '../../logging.js';


function calcTime( t_src, t_dest, vol, kw, efficiency ) {

	return 0;
}

export default function( args, config, env ){

	Assert.present( 'args.heat', args.heat );
	Assert.present( 'args.rate', args.rate );
	Assert.present( 'args._from', args._from );
	if( !args.hold ) args.hold = 0;

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

