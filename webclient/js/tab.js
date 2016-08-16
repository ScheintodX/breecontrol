"use strict";

/**
 * Master control for one tab.
 *
 * Does only a little layout
 */

BAG.Tab = (function($){

	return function( elem, device ) {

		var $elem = ( elem instanceof jQuery ? elem : $( elem ) )
				.expectOne(),
			$header = $elem.find( 'header' )
				.expectOne()
				;

		// Tab Header Controls
		$header.find( 'button' )
				.on( 'click', function(){
					var clz = $(this).attr( 'class' );
					$elem.find( 'section.'+clz ).toggleClass( 'visible' );
				} )
				;

		return {};

	};

})($);
