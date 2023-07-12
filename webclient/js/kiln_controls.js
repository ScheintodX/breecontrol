"use strict";

BAG.Kiln_Controls = (function($){

	return function( elem, device ) {

		var _onControl = false;

		var $e = ( elem instanceof jQuery ? elem : $( elem ) )
				.expectOne(),
			$secManual = $e.find( 'section.manual' )
				.expectOne()
			;

		function notify( on, topic, value ) {
			console.trace( "NOTIFY", on, topic, value );
			_onControl( { on: on, topic: topic, value: value, device: device } );
		}

		function Control( sel, scale ) {

			var $c = $secManual.find( sel )
					;

			if( !$c.isOne() ) return undefined;

			// topic (for notify) is taken from button name.
			var topic = $c.attr('name');

			var control = BAG.Button( $c, topic, scale )
					.onNotify( notify )
					;

			if( topic.match( /\.override$/ ) )
					control = control.override();

			return control;
		}

		var manualControls = {
		// Tunde
		 	'temp': Control( 'input[name=".temp.set"]' ),

		// Override
			'extramass': Control( 'input[name=".extramass"] ', 200 ),
			'door.override': Control( 'input[name=".door.override"] ', 100 ),
		};

		function gotData( data ) {

			if( 'devices' in data ) {

				var kiln = data.devices[ device ];

				$e.find( 'header h1' )
						.text( kiln.name )
						;

				for( var key in manualControls ) {

					var value = key.getFrom( kiln );
					if( typeof( value ) == 'undefined' ) continue;

					var control = manualControls[ key ];
					if( typeof( control ) == 'undefined' ) continue;

					control.set( value );
				}

			}
		}

		var KilnControls = {

			gotData: gotData,

			onControl: function( onControl ) {

				_onControl = onControl;
			}
		};

		return KilnControls;
	}

})($);
