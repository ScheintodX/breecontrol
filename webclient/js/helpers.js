
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
function floor( val, prec ) {
	return Math.floor( val * prec ) / prec;
}
function zf2( val ) {
	if( val > 9 ) return ''+val;
	else return '0'+val;
}
Number.prototype.toTemp = function( prec ) {
	if( !prec ) prec = 10;
	return floor( this, prec ).toLocaleString() + '°';
};
Number.prototype.toTempC = function( prec ) {
	if( !prec ) prec = 10;
	return floor( this, prec ).toLocaleString() + '°C';
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
Number.prototype.toScale = function( prec ) {
	if( !prec ) prec = 10;
	return floor( this, prec ).toLocaleString();
}
/*
String.prototype.toF = function() {
	return parseFloat( this );
}
Number.fromMinSecLong( str ) {
	var matches = /(\d+)\s*(h|min)/;
}
*/

String.prototype.getFrom = function( obj ) {

	var parts = this.split( '.' );

	for( var i=0; i<parts.length; i++ ) {

		var part = parts[ i ];

		if( !( part in obj ) ) return undefined;

		obj = obj[ parts[ i ] ];
	}

	return obj;
}

Array.prototype.has = function( val ) {
	return this.indexOf( val ) >= 0;
}

function onlyIfChanged( f ) {
	var old;
	return function( val ) {
		var asJson = JSON.stringify( val );
		if( asJson != old ) {
			f( val );
			old = asJson;
		}
	}
}

// Add to a function so it is only called if the passed
// argument differs from last call.
Function.prototype.onlyIfChanged = function(){
	return onlyIfChanged( this );
}
