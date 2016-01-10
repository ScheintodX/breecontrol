"use strict";

var BAG_Controls = (function($){

	return function( elem, device ) {

		var _onControl = false;

		var $e = $( elem ),
			$header = $e.find( 'header' ).expectOne(),
			$secScript = $e.find( 'section.script' ).expectOne(),
			$secManual = $e.find( 'section.manual' ).expectOne(),
			$secLoadSave = $e.find( 'section.loadsave' ).expectOne(),
			$secRunStop = $e.find( 'section.runstop' ).expectOne()
			;

		// Visual Controls
		$header.find( 'button.script' )
				.expectOne()
				.on( 'click', function(){ $secScript.toggleClass( 'visible' ); } )
				;
		$header.find( 'button.manual' )
				.expectOne()
				.on( 'click', function(){ $secManual.toggleClass( 'visible' ); } )
				;

		// Comm

		function notify( on, topic, value ) {
			console.trace( "NOTIFY", on, topic, value );
			_onControl( { on: on, topic: topic, value: value, device: device } );
		}

		// Manual

		function onClickCheckbox( on ) {
			return function( ev ) {
				var $this = $(this);
			}
		}

		function Control( sel, scale ) {

			var $c = $e.find( sel );

			// topic (for notify) is taken from button name.
			var topic = $c.attr('name');

			var control = BAG_Button( $c.attr( 'type' ), $c, topic, scale )
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
			function valFF( i, name ) {
				return valF( $secLoadSave.find( 'div.step' + i ), name );
			}

			var steps = []
			steps.push( { heat: valFF( 0, 'heat' ) } )
			for( var i=1; i<4; i++ ) {

				steps.push( {
					heat: valFF( i, 'heat' ),
					hold: valFF( i, 'hold' )
				} )
			}
			steps.push( { heat: valFF( 4, 'heat' ) } )

			var prog = {
				name: val( $secLoadSave, 'name' ),
				load: val( $secLoadSave, 'load' ),
				steps: steps
			}
			return prog;
		}

		function storeScript( prog ) {

			function val( $s, name, value ){
				return $s.find( '[name="' + name + '"]' )
						.expectOne()
						.val( value );
			}
			function valF( idx, name, value ) {
				var $step = $secLoadSave.find( "div.step" + idx )
						.expectOne();
				val( $step, name, value );
			}

			val( $secLoadSave, 'name', prog.name );

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
				return $secRunStop.find( 'button[name="' + name + '"]' )
						.expectOne();
			}

			$button( 'start' ).setEnable( actions.has( 'start' ) );
			$button( 'stop' ).setEnable( actions.has( 'stop' ) );
			$button( 'pause' ).setEnable( actions.has( 'pause' ) );
			$button( 'resume' ).setEnable( actions.has( 'resume' ) );
			$button( 'next' ).setEnable( actions.has( 'next' ) );
			$button( 'prev' ).setEnable( actions.has( 'prev' ) );

			$button( 'pause' ).setVisible( actions.has( 'pause' ) );
			$button( 'resume' ).setVisible( !actions.has( 'pause' ) );
		}

		enableButtons( [] );

		$secRunStop.find( 'button' )
				.on( 'click', onClick( 'runstop' ) )
				;

		$secLoadSave.find( 'button' )
				.on( 'click', onClick( 'loadsave' ) )
				;

		// Callback for received data from Ctrl

		function gotData( data ) {

			if( 'boilers' in data ) {

				var boiler = data.boilers[ device ];

				var name = boiler.name;

				$e.find( 'header h1' ).text( 'Boiler ' + (boiler.index+1) + ": " + boiler.name );
				for( var key in manualControls ) {

					var value = key.getFrom( boiler );

					if( typeof( value ) == 'undefined' ) continue;

					manualControls[ key ].set( value );
				}

				if( 'script' in boiler ) {

					var script = boiler.script;

					$e.find( 'header h2' ).text( script.name );

					storeScript( script );

					enableButtons( script.actions );

					// Info
					if( script.current ) {
						var current = script.current;
						$('.runstopinfo').text( (current.index+1) + ". " +
								current.desc + " [" + current.mode + ']' );
					} else {
						$('.runstopinfo').text( " - no script - " );
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

				$e.find( 'section.loadsave select' )
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
