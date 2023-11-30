import { E } from '../../E.js';
import { Assert } from '../../assert.js';
import { log } from '../../logging.js';


export default function( args, config, env ){

	var self = {

		start: function( current, boiler ) {
			current.desc = "Notify " + args.what;
			if( args.msg ) current.desc += " " + args.msg;
		},
		run: function( current, boiler ) {

			if( current.mode != 'run' ) return;

			boiler.indicator._notify( args.what );
			env.notify( boiler, args.what, args.msg );

			current.mode = 'done';
		}
	}
	return self;
}
