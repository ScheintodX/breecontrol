"use strict";

var BAG_Info = (function($){

	return function( sel, device ) {

		var $e = $(sel)
				.hide(),
			$content = $('<div/>')
				.appendTo( $e );
				;

		function setInfo( level, messages ) {

			$e.replaceClass( 'warn severe', level )
					;

			$content.empty().append(
					$.map( messages, function( msg ) {
						return $( '<div class="' + msg.level + '">' + msg.text + '</div>' );
					} )
			);

		}

		var Info = {

			gotData: function( data ) {

				if( 'boilers' in data ) {

					var boiler = data.boilers[ device ];

					if( 'warn' in boiler && boiler.warn.messages.length > 0 ) {

						var level = boiler.warn.level;
						var messages = boiler.warn.messages;

						setInfo( level, messages );

						$e.show();
					} else {
						$e.hide();
					}
				}

				if( 'message' in data ) {

					var message = data.message;

					if( message.device != device ) return;

					setInfo( message.level, message.messages );

					$e.show();
				}
			}

		};
		return Info;
	};
})($);
