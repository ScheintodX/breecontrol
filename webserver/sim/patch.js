"use strict";


Number.prototype.jitter = function( amount ) {

	return this + Math.random() * amount * 2 - amount;
}
