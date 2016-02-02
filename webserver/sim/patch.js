"use strict";


Number.prototype.jitter = function( amount ) {

	var jitter = ( Math.random() * 2 - 1 ) * amount; 

	return this + jitter;
}
