"use strict";

var BAG_Controls = (function($){

	return function( elem, boilerNo ) {

		var _onControl = false;

		var $e = $( elem ),
			$header = $e.find( 'header' ),
			$chart = $e.find( 'section.chart' ),
			$ctrl = $e.find( 'section.ctrl' )
			;

		// Visual Controls
		$header.find( 'button.chart' )
				.on( 'click', function(){ $chart.toggleClass( 'visible' ); } )
				;
		$header.find( 'button.settings' )
				.on( 'click', function(){ $ctrl.toggleClass( 'visible' ); } )
				;

		// Comm

		function notify( on, topic, value ) {
			console.trace( "NOTIFY", on, topic, value );
			_onControl( { on: on, topic: topic, value: value, no: boilerNo } );
		}

		// Manual

		function onClickCheckbox( on ) {
			return function( ev ) {
				var $this = $(this);
			}
		}

		var $secManual = $ctrl.find( 'section.manual' );

		function Control( sel, scale ) {

			var $e = $secManual.find( sel );

			// topic (for notify) is taken from button name.
			var topic = $e.attr('name');

			var control = BAG_Button( $e.attr( 'type' ), $e, topic, scale )
					.onNotify( notify )
					;

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

		// runstop / loadsave
		function onClick( on ) {
			return function() {
				var $this = $(this);
				notify( on, $this.attr('class'), readProgramm() );
			}
		}
		
		function readProgramm() {

			function val( $s, name ) {
				return $s.find( '[name="' + name + '"]' ).val();
			}
			function valF( $s, name ) {
				return parseFloat( val( $s, name ) );
			}

			var $sec = $ctrl.find( 'section.loadsave' );

			var prog = {
				name: val( $sec, 'name' ),
				load: val( $sec, 'load' ),
				steps: $sec.find( 'div.step' ).map( function() {
					var $this = $(this);
					return { temp: valF( $this, 'temp' ), time: valF( $this, 'time' ) * 60 }
				} ).get()
			}
			return prog;
		}

		function storeProgramm( prog ) {

			function val( $s, name, value ){
				return $s.find( '[name="' + name + '"]' ).val( value );
			}
			function valF( $s, name, value ) {
				return val( $s, name, ""+value );
			}

			var $sec = $ctrl.find( 'section.loadsave' );

			val( $sec, 'name', prog.name );
			val( $sec, 'load', prog.load );
			$.each( prog.steps, function( step, i ){
				var $step = $sec.find( 'div.step' + i );
				valF( $step, 'temp', step.temp );
				valF( $step, 'fill', step.fill );
			} );

		}

		$ctrl.find( 'section.runstop button' )
				.on( 'click', onClick( 'runstop' ) )
				;
		$ctrl.find( 'section.loadsave button' )
				.on( 'click', onClick( 'loadsave' ) )
				;

		// Callback for received data from Ctrl

		function gotData( data ) {

			if( 'boilers' in data ) {

				var boiler = data.boilers[ 'boiler' + boilerNo ];

				for( var key in manualControls ) {

					var value = key.getFrom( boiler );

					if( typeof( value ) == 'undefined' ) continue;

					manualControls[ key ].set( value );
				}
			}
		}

		var Controls = {

			gotData: gotData,

			onControl: function( onControl ) {

				_onControl = onControl;
			}
		}

		return Controls;
	}

})($);
