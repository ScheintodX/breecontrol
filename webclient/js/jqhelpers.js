"use strict";

(function($){

	$.fn.peek = function() {
		console.log( this );
		return this;
	};

	$.fn.expectFound = function() {

		if( this.length == 0 ) 
				console.warn( "NOT FOUND", this );

		return this;
	};
	$.fn.expectOne = function() {

		if( this.length != 1 ) 
				console.warn( "NOT 1 FOUND", this );

		return this;
	};

	$.fn.isOn = function() {
		return this.val() == 'on';
	};
	$.fn.setOn = function( val ){
		if( val ) this.val( 'on' );
		else this.val( 'off' );
	};
	$.fn.togOn = function() {
		this.setOn( !this.isOn() );
	};

})($);
