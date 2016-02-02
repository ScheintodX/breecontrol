"use strict";

BAG.Info = (function($){

	return function( elem, device ) {

		var $e = ( elem instanceof jQuery ? elem : $( elem ) )
				.expectOne()
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

				if( 'devices' in data ) {

					var boiler = data.devices[ device ];

					if( 'warn' in boiler && boiler.warn.messages.length > 0 ) {

						var level = boiler.warn.level;
						var messages = boiler.warn.messages;

						setInfo( level, messages );
					}
				}

				if( 'message' in data ) {

					var message = data.message;

					if( message.device != device ) return;

					setInfo( message.level, message.messages );
				}

				if( $content.children().length > 0 ) {

					$e.show();
				} else {
					$e.hide();
				}
			}
		};
		return Info;
	};
})($);
