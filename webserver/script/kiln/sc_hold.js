import E from '#E';
import Assert from '#assert';
import log from '#logging';


export default function( args, config, env ){

	Assert.present( 'args.heat', args.heat );
	Assert.present( 'args.hold', args.hold );

	var _pauseStart,
	    _pauseTime = 0;

	var self = {

		start: function( current, boiler ) {

			current.start = env.time();
			current.desc = 'Hold ' + args.heat + '°C for ' + (args.hold/60) + 'min';

			boiler.temp.setTo( args.heat );

			log.info( "Start", current.desc );
		},
		pause: function( current, boiler ) {

			_pauseStart = env.time();
			boiler.temp.setTo( 0 );
		},
		resume: function( current, boiler ) {

			_pauseTime += env.time() - _pauseStart;
			boiler.temp.setTo( args.hold );
		},
		stop: function( current, boiler ) {

			boiler.temp.setTo( 0 );
		},
		run: function( current, boiler ) {

			if( current.mode != 'run' ) return;

			current.elapsed = env.time() - current.start - _pauseTime;
			current.remaining = args.hold - current.elapsed;

			if( current.remaining <= 0 ) {
				current.mode = 'done';
			}
		},

		guessRuntime: function( current, boiler ) {
			return args.hold;
		}
	}
	return self;
}
