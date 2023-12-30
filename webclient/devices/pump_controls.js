export default function( elem, device ) {

	var _onControl = false;

	var $e = ( elem instanceof jQuery ? elem : $( elem ) )
			.expectOne(),
		$secManual = $e.find( 'section.manual' )
			.expectOne()
		;

	function notify( on, topic, value ) {
		console.log( "NOTIFY", on, topic, value );
		_onControl( { on: on, topic: topic, value: value, device: device } );
	}

	function Control( sel, scale ) {

		var $c = $secManual.find( sel )
				;

		if( ! $c.isOne() ) return undefined;

		// topic (for notify) is taken from button name.
		var topic = $c.attr('name');

		var control = BAG.Control( $c, topic, scale )
				.onNotify( notify )
				;

		return control;
	}

	var manualControls = {
	// Set
		'mode': Control( 'select[name=".pump.mode.set" ]' )
	};

	function gotData( data ) {

		if( 'devices' in data ) {

			var pump = data.devices[ device ];

			$e.find( 'header h1' )
					.text( pump.name )
					;

			for( var key in manualControls ) {

				var value = key.getFrom( pump );
				if( typeof( value ) == 'undefined' ) continue;

				var control = manualControls[ key ];
				if( typeof( control ) == 'undefined' ) continue;

				control.set( value );
			}

		}
	}

	var PumpControls = {

		gotData: gotData,

		onControl: function( onControl ) {

			_onControl = onControl;
		}
	};

	return PumpControls;
}
