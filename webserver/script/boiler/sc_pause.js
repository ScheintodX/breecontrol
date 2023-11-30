import { E } from '../../E.js';
import { Assert } from '../../assert.js';
import { log } from '../../logging.js';


export default function( args, config, env ){

	var self = {

		start: function( current, boiler ) {
			current.desc = "Waiting...";
			log.info( "Have a break" );
		},
		resume: function( current, boiler ) {
			current.mode = 'done';
		},
		run: function( current, boiler ) {
			// Only works because mode checking for 'done' is done before run
			current.mode = 'pause';
		}
	}
	return self;
};

