"use strict";

BAG.Script = (function($,BAG){

	return function( elem, device ) {

		var _onControl = false;

		var oldSteps,
		    oldCurrent;

		var curChart = false,
			curControls = false
			;

		var $elem = ( elem instanceof jQuery ? elem : $( elem ) ).expectOne(),

			$secScript = $elem.find( 'section.script' ).expectOne(),
			$secLoadSave = $elem.find( 'section.loadsave' ).expectOne(),
			$secProgram = $elem.find( 'section.program' ).expectOne(),
			$secRunStop = $elem.find( 'section.runstop' ).expectOne(),

			$selectLoad = $secLoadSave.find( 'select[name="load"]' ).expectOne()
			;

		// Comm

		function notify( on, topic, value ) {

			console.trace( "NOTIFY", on, topic, value );
			_onControl( { on: on, topic: topic, value: value, device: device } );
		}

		function readScript() {

			var script = curControls ? curControls.readScript() : {};

			script.load = $selectLoad.val();

			return script;
		}

		var storeScript = (function( data ) {

			if( curControls ) curControls.storeScript( data );

		}).onlyIfChanged();

		function clearScript() {
			if( curControls ) curControls.clearScript();
		}

		// runstop / loadsave
		function onClick( on ) {

			return function() {
				var $this = $(this);
				notify( on, $this.attr('name'), readScript() );
			}
		}
		function onLoadClick() {
			return function() {
				var $select = $secLoadSave.find( 'select[name="load"]' ).expectOne(),
					val = $select.val()
					;
				notify( 'loadsave', 'load', { load: val } );
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

		// Run / Stop / Pause / ...
		$secRunStop.find( 'button' )
				.on( 'click', onClick( 'runstop' ) )
				;

		// Load
		$secLoadSave.find( 'button' )
				.on( 'click', onClick( 'loadsave' ) )
				;

		// Save / Set
		$secProgram.find( 'button' )
				.on( 'click', onClick( 'loadsave' ) )
				;

		var setRunstopInfo = function( val ) {
			console.log( val );

			console.log( $elem.find( '.runstopinfo' ) );

			$elem.find( '.runstopinfo' )
					.expectOne()
					.text( val )
					;

		}.onlyIfChanged();

		function updateElements( script ) {

			$elem.find( 'header h2' ).text( script.name );

			if( curControls ){
				storeScript( script );
			}

			enableButtons( script.actions );

			// Info
			if( script.current ) {

				var current = script.current;

				setRunstopInfo( (current.index+1) + ". " +
						current.desc + " [" + current.mode + ']' );

			} else {
				setRunstopInfo( " - no script - " );
			}
		}

		function clearElements() {

			$elem.find( 'header h2' ).text( '' );

			if( curControls ) clearScript();

			enableButtons( [] );

			setRunstopInfo( '' );
		}

		// Callback for received data from Ctrl
		function gotData( data ) {

			if( 'boilers' in data ) {

				var boiler = data.boilers[ device ];

				if( 'script' in boiler ) {

					var script = boiler.script;

					if( ! curChart ) {

						// prevent double loading but must be checked for if used
						curChart = true;

						BAG.Load.loadModule( "5Steps", function( err, data ){

							if( err ) throw new Error( err );

							$secScript.find( '.ctrl_program' )
									.expectOne()
									.empty()
									.append( $( data.html ) )
									;

							curControls = data.Controls( $secScript, device );
							curChart = data.Chart( $secScript, device );

							console.trace( "LOADED", curControls.name );

						} );

					} else {
						updateElements( script );
					}
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

			if( curChart && curChart !== true ){
				curChart.gotData( data );
				curControls.gotData( data );
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

})($,BAG);
