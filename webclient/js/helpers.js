"use strict";

function peek( what ){

	console.log.apply( console, arguments );

	return what;
}

(function(){

function Time( val ) {

	var sall = Math.floor( val ); // cut ms
	var hall = Math.floor( sall/3600 );
	var mall = Math.floor( sall/60 );
	var m = mall - hall*60;
	var s = sall - mall*60;

	return { hall: hall, min: m, mall: mall, sec: s };
}
function round( val, prec ) {
	return Math.round( val * prec ) / prec;
}
function zf2( val ) {
	if( val > 9 ) return ''+val;
	else return '0'+val;
}
Number.prototype.toTemp = function( prec ) {
	if( !prec ) prec = 10;
	return round( this, prec ).toLocaleString() + '°';
};
Number.prototype.toTempC = function( prec ) {
	if( !prec ) prec = 10;
	return round( this, prec ).toLocaleString() + '°C';
};
Number.prototype.toMinSec = function() {
	var t = Time( this );
	return t.mall + ':' + zf2( t.sec );
};
Number.prototype.toHMinLong = function() {
	var t = Time( this ),
		result = t.min + "min"
		;
	if( t.hall > 0 ) result = t.hall + "h " + result;
	return result;
};
Number.prototype.toHourMinSec = function() {
	var t = Time( this );
	return t.hall + ':' + zf2( t.min ) + ':' + zf2( t.sec );
};
Number.prototype.toPercent = function() {
	return Math.round( this*100 ) + '%';
}
/*
String.prototype.toF = function() {
	return parseFloat( this );
}
Number.fromMinSecLong( str ) {
	var matches = /(\d+)\s*(h|min)/;
}
*/

/*
var H = (function($){
	return {
	}
})($);
*/
})();
