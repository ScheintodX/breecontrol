import BAG_Control from '../js/controls.js';

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

		var $c = $secManual.find( sel );

		if( !$c.isOne() ) return undefined;

		// topic (for notify) is taken from button name.
		var topic = $c.attr('name');

		var control = BAG_Control( $c, topic, scale )
				.onNotify( notify );

		if( topic.match( /\.override$/ ) )
				control = control.override();

		return control;
	}

	var manualControls = {
	// Set
		'temp.nominal': Control( 'input[name=".temp.set" ]' ),
		'aggitator.nominal': Control( 'input[name=".aggitator.set" ]' ),

	// Tunde
		'upper.temp.max': Control( 'input[name=".upper.temp.max"]' ),
		'lower.temp.max': Control( 'input[name=".lower.temp.max"]' ),

	// Override
		'fill.override': Control( 'input[name=".fill.override"] ', 100 ),
		'lid.override': Control( 'input[name=".lid.override"] ' )
	};

	function gotData( data ) {

		if( 'devices' in data ) {

			var boiler = data.devices[ device ];

			$e.find( 'header h1' )
					.text( boiler.name );

			for( var key in manualControls ) {

				var value = key.getFrom( boiler );
				if( typeof( value ) == 'undefined' ) continue;

				var control = manualControls[ key ];
				if( typeof( control ) == 'undefined' ) continue;

				control.set( value );
			}

		}
	}

	var BoilerControls = {

		gotData: gotData,

		onControl: function( onControl ) {

			_onControl = onControl;
		}
	};

	return BoilerControls;
}
