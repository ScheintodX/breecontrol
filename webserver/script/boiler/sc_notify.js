import E from "../../E.js";
import Assert from "../../assert.js";
import log from "../../logging.js";


export default function( args, config, env ){

	var self = {

		start: function( current, device ) {
			current.desc = "Notify " + args.what;
			if( args.msg ) current.desc += " " + args.msg;
		},

		run: function( current, device ) {

			if( current.mode != "run" ) return;

			if( device.indicator && typeof device.indicator._notify === "function" ){
				device.indicator._notify( args.what );
			}
			env.notify( device, args.what, args.msg );

			current.mode = "done";
		}
	}
	return self;
}
