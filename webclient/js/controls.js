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

		function notify( on, ctrl, value ) {
			_onControl( { on: on, ctrl: ctrl, value: value, no: boilerNo } );
		}

		// Manual

		function onClickCheckbox( on ) {
			return function( ev ) {
				var $this = $(this);
			}
		}

		var $secManual = $ctrl.find( 'section.manual' );

		function Control( sel, scale ) {

			if( !scale ) scale=1;

			var $e = $secManual.find( sel );

			var control = {
				element: $e
			};

			var topic = $e.attr('name')
					.replace( /\.(nominal|status)$/, '.set' );

			var edit = false;
			
			switch( $e.prop( 'type' ) ) {

				case 'number':

					$e.on( 'change', function() {
						notify( 'manual', topic, parseFloat( $e.val() ) / scale ); } )
					  .on( 'focus', function() { edit=true; } )
					  .on( 'focusout', function() { edit=false; } )

					control.set = function( val ) {
						if( edit ) return;
						$e.val( val * scale );
					}
					break;

				case 'checkbox':

					$e.on( 'click', function( val ) {
						$e.prop( 'disabled', true );
						notify( 'manual', topic, $e.prop('checked') );
						return false;
					} );

					control.set = function( val ) {
						var checked = (val==1);
						$e.prop( {
							checked: checked,
							disabled: false
						} );
					}
					break;
			}

			return control;
		}
		var manualControls = {
		// Set
			'temp.nominal': Control( 'input[name=".temp.nominal" ]' ),
			'aggitator.status': Control( 'input[name=".aggitator.status" ]' ),

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

				for( key in manualControls ) {

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
