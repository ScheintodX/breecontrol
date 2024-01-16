import E from '#E';
import Assert from '#assert';
import log from '#logging';


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

