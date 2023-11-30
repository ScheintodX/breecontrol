import { E } from '../../E.js';
import { Assert } from '../../assert.js';
import { log } from '../../logging.js';


export default function( args, config, env ){

	var self = {

		start: function( current, boiler ) {

			current.desc = "Stop";
		},

		run: function( current, boiler ) {

			if( current.mode != 'run' ) return current.mode;

			current.mode = 'stop';
		}
	}
	return self;
};

