"use strict";

function ex( up ) {

	try {
		throw new Error('');
	} catch( ex ) {
		return ex.stack.split( /\n/g )[ up ].trim();
	}
}

$.fn.peek = function() {
	console.log( this );
	return this;
};

$.fn.isOne = function() {
	return this.length == 1;
}

$.fn.expectFound = function() {

	if( this.length != 0 ) {
		throw new Error( "NOT FOUND: " + this.selector + " " + ex( 3 ) );
	}

	return this;
};

$.fn.expectOne = function() {

	if( this.length != 1 ) {
		throw new Error( "NOT 1 FOUND: " + this.selector + " " + ex( 3 ) );
	}

	return this;
};

$.fn.expectN = function( n ) {

	if( this.length != n ) {
		throw new Error( "NOT " + n + " FOUND: " + this.selector + " " + ex( 3 ) );
	}

	return this;
};

$.fn.isOn = function() {
	return this.val() == 'on';
};
$.fn.setOn = function( val ){
	if( val ) this.val( 'on' );
	else this.val( 'off' );
	return this;
};
$.fn.togOn = function() {
	return this.setOn( !this.isOn() );
};

$.fn.replaceClass = function( what, withwhat ) {
	return this.removeClass( what )
			.addClass( withwhat )
			;
};

$.fn.setEnable = function( enable ) {
	if( enable ) {
		this.prop( 'disabled', false );
	} else {
		this.prop( 'disabled', true );
	}
	return this;
};

$.fn.setVisible = function( visible ) {
	if( visible ) this.show();
	else this.hide();
	return this;
};
