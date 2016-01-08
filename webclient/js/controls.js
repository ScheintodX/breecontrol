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
				notify( on, $this.attr('name'), readScript() );
			}
		}
		
		function readScript() {

			function val( $s, name ) {
				return $s.find( '[name="' + name + '"]' ).val();
			}
			function valF( $s, name ) {
				return parseFloat( val( $s, name ) );
			}

			var $loadsave = $ctrl.find( 'section.loadsave' );

			var steps = []
			for( var i=0; i<6; i++ ) {

				var $step = $loadsave.find( 'div.step' + (i/2)<<0 )
						.expectOne();;
				steps.push( { action: 'heat', temp: valF( $step, 'temp' ) } )
				steps.push( { action: 'hold', time: valF( $step, 'time' ) } )
			}

			var prog = {
				name: val( $loadsave, 'name' ),
				load: val( $loadsave, 'load' ),
				steps: steps
			}
			return prog;
		}

		function storeScript( prog ) {

			var $loadsave = $ctrl.find( 'section.loadsave' );

			function val( $s, name, value ){
				return $s.find( '[name="' + name + '"]' )
						.expectOne()
						.val( value );
			}
			function valF( idx, name, value ) {
				var $step = $loadsave.find( "div.step" + idx )
						.expectOne();
				val( $step, name, value );
			}

			val( $loadsave, 'name', prog.name );

			valF( 0, 'heat', prog.steps[ 0 ].heat );

			for( var i=1; i<4; i++ ) {
				var step = prog.steps[ i ];
				valF( i, 'heat', step.heat );
				valF( i, 'hold', step.hold );
			}

			valF( 4, 'heat', prog.steps[ 4 ].heat );
		}

		function enableButtons( actions ) {

			function $button( name ) {
				return $ctrl.find( 'section.runstop button[name="' + name + '"]' )
						.expectOne();
			}

			$button( 'start' ).setEnable( actions.has( 'start' ) );
			$button( 'stop' ).setEnable( actions.has( 'top' ) );
			$button( 'pause' ).setEnable( actions.has( 'pause' ) );
			$button( 'resume' ).setEnable( actions.has( 'resume' ) );
			$button( 'next' ).setEnable( actions.has( 'next' ) );
			$button( 'prev' ).setEnable( actions.has( 'prev' ) );

			$button( 'pause' ).setVisible( !actions.has( 'pause' ) );
			$button( 'resume' ).setVisible( actions.has( 'pause' ) );
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

				if( 'script' in boiler ) {

					storeScript( boiler.script );

					enableButtons( boiler.script.actions );

					// Info
					if( boiler.script.current ) {
						var current = boiler.script.current;
						$('.runstopinfo').text( current.index + ". " +
								current.desc + ": " + current.mode );
					} else {
						$('.runstopinfo').text( "no current" );
					}
				}
			} 
			
			if( 'config' in data ) {

				var config = data.config;

				console.trace( "CONFIG", config );

			} 
			
			if( 'scripts' in data ) {

				var scripts = data.scripts;

				console.trace( "SCRIPTS", scripts );

				var $options = $.map( scripts, function( script ){
					return $('<option/>')
							.val( script.file )
							.text( script.name )
							;
				} )

				$ctrl.find( 'section.loadsave select' )
						.empty()
						.append( $("<option>--</option>" ) )
						.append( $options );
						;
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
