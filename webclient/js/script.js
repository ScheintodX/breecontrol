"use strict";

var BAG_Script = (function($){

	return function( elem, device ) {

		var _onControl = false;

		var $elem = ( elem instanceof jQuery ? elem : $( elem ) ).expectOne(),
			$secScript = $elem.find( 'section.script' ).expectOne(),
			$secLoadSave = $elem.find( 'section.loadsave' ).expectOne(),
			$secProgram = $elem.find( 'section.program' ).expectOne(),
			$secRunStop = $elem.find( 'section.runstop' ).expectOne()
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
				return valF( $secProgram.find( 'div.step' + i ), name );
			}

			var steps = []
			steps.push( { heat: valFF( 0, 'heat' ) } )
			for( var i=1; i<4; i++ ) {

				steps.push( {
					heat: valFF( i, 'heat' ),
					hold: valFF( i, 'hold' ) * 60
				} )
			}
			steps.push( { heat: valFF( 4, 'heat' ) } )

			var prog = {
				name: val( $secProgram, 'name' ),
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
				var $step = $secProgram.find( "div.step" + idx )
						.expectOne();
				val( $step, name, value );
			}

			val( $secProgram, 'name', prog.name );

			valF( 0, 'heat', prog.steps[ 0 ].heat );

			for( var i=1; i<4; i++ ) {
				var step = prog.steps[ i ];
				valF( i, 'heat', step.heat );
				valF( i, 'hold', step.hold/60 );
			}

			valF( 4, 'heat', prog.steps[ 4 ].heat );
		}

		function clearScript() {

			function val( $s, name, value ){
				return $s.find( '[name="' + name + '"]' )
						.val( value );
			}

			function clear( $s, name ) {
				val( $s, name, null );
			}

			clear( $secProgram, 'name' );
			for( var i=0; i<5; i++ ) {
				var $step = $secProgram.find( 'div.step' + i );
				clear( $step, 'heat' );
				clear( $step, 'hold' );
			}
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

		$secProgram.find( 'button' )
				.on( 'click', onClick( 'loadsave' ) )
				;

		// Callback for received data from Ctrl
		
		var oldSteps, oldCurrent;

		var curCtrl = false;

		function updateElements( script ) {

			$elem.find( 'header h2' ).text( script.name );

			var asJson = JSON.stringify( script.steps );
			if( asJson != oldSteps ) {
				storeScript( script );
				oldSteps = asJson;
			}
			enableButtons( script.actions );

			// Info
			if( script.current ) {
				var current = script.current;

				asJson = JSON.stringify( current );
				if( oldCurrent != asJson ) {

					oldCurrent = asJson;

					$('.runstopinfo').text( (current.index+1) + ". " +
							current.desc + " [" + current.mode + ']' );
				}
			} else {
				$('.runstopinfo').text( " - no script - " );
			}
		}

		function clearElements() {
			$elem.find( 'header h2' ).text( '' );
			clearScript();
			enableButtons( [] );
			$('.runstopinfo').text( '' );
		}

		function gotData( data ) {

			if( 'boilers' in data ) {

				var boiler = data.boilers[ device ];

				if( 'script' in boiler ) {

					var script = boiler.script;

					if( ! curCtrl ) {

						$elem.find( '.ctrl_program' )
								.expectOne()
								.load( '5steps.html', function() {

									updateElements( script );
								} )
								;

						curCtrl = BAG_5steps( $secScript.find( 'object.chart' ), device );

						/*
						$secScript.find( 'object' )
								.attr( 'data', '5steps.svg' )
								;
						*/

					} else {
						updateElements( script );
					}

				} else {

					clearElements();
				}
			} 
			
			if( 'scripts' in data ) {

				var scripts = data.scripts;

				var $options = $.map( scripts, function( script ){
					return $('<option/>')
							.val( script.file )
							.text( script.name )
							;
				} )

				$elem.find( 'section.loadsave select' )
						.empty()
						.append( $("<option>--</option>" ) )
						.append( $options );
						;
			}

			if( curCtrl ){
				curCtrl.gotData( data );
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
