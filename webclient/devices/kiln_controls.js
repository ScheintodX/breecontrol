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

		// instance is determined by input html
		var control = BAG_Control( $c, topic, scale )
				.onNotify( notify )
				;

		if( topic.match( /\.override$/ ) )
				control = control.override();

		return control;
	}

	var manualControls = {

		// System
		'system.set': Control( 'input[name=".system.set" ]' ),

		// Temperature
		'powerfactor.set': Control( 'input[name=".powerfactor.set"]', 100 ),

		// Tuning
		'extramass.set': Control( 'input[name=".extramass.set"] ', 0.001 ),
		'damper.set': Control( 'input[name=".damper.set"] ', 1 )

		// Override
		//'door.override': Control( 'input[name=".door.override"] ' ),
	};

	function gotData( data ) {

		if( 'devices' in data && device in data.devices ) {

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
