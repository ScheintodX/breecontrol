import { Mqtt } from '../helpers.js';
import _ from 'underscore';
import { E } from '../E.js';

export default function( conf, defaults ) {

	defaults = defaults || {};

	var self = _.defaults( {

		_conf: conf,

		set: undefined,

		setByWeb: function( topic, val ) {

			E.x( "web", topic, val );
			self.set = val;
		}

	}, defaults );

	return self;
};
