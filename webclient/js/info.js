"use strict";

var BAG_Info = (function($){

	return function( sel, device ) {

		var $e = $(sel)
				.hide(),
			$content = $('<div/>')
				.appendTo( $e );
				;

		var Info = {

			gotData: function( data ) {

				if( !( 'boilers' in data ) ) return;

				var devData = data.boilers[ device ];

				if( 'warn' in devData && devData.warn.messages.length > 0 ) {

					console.trace( devData.warn );

					var level = devData.warn.level;
					var messages = devData.warn.messages;

					$e.replaceClass( 'warn severe', level )
							;

					$content.empty()
							.append( $.map( messages, function( msg ) {
						return $( '<div class="' + msg.level + '">' + msg.text + '</div>' );
					} ) );

					$e.show();
				} else {
					$e.hide();
				}
			}

		};
		return Info;
	};
})($);
