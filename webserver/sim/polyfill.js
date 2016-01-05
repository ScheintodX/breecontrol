"use strict";

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(searchString, position) {
		position = position || 0;
		return this.indexOf( searchString, position ) === position;
	};
}

Number.prototype.mqtt = function( pow ) {
	var fac = Math.pow( 10, pow );
	return ''+Math.round( this * fac ) / fac;
}
Boolean.prototype.mqtt = function() {
	return this ? '1' : '0';
}
