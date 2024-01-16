import { Mqtt } from '../helpers.js';
import _ from 'underscore';
import E from '../E.js';

/**
 * Stores a value set by mqtt via the "status" topic
 *
 * The value can be shown in the webapp
 *
 * This value publishes noghing but it can be overridden.
 * This is usefull eg simulating a closed lid while it is
 * not.
 */
export default function( conf, defaults ) {

	/*
	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		value: undefined,

		setByWeb: function( topic, val ) {
			if( topic == 'set' ) self.value = val;
		}

	}, defaults );

	return self;
	*/
	return {
		setByWeb: function( topic, val ) {}
	}
};
