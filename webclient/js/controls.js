"use strict";

var BAG_Controls = (function($){

	return function( elem, boilerNo ) {

		var _onControl = false;

		var $e = $( elem ),
			$header = $e.find( 'header' ),
			$chart = $e.find( 'section.chart' ),
			$ctrl = $e.find( 'section.ctrl' )
			;

		function notify( on, ctrl, value ) {
			_onControl( { on: on, ctrl: ctrl, value: value, no: boilerNo } );
		}

		function onClick( on ) {
			return function() {
				var $this = $(this);
				notify( on, $this.attr('class'), readProgramm() );
			}
		}
		
		function onChangeCheckbox( on ) {
			return function( ev ) {
				var $this = $(this);
				notify( on, $this.attr('name'), $this.prop('checked') );
			}
		}

		function onChangeFloat( on, scale ) {
			return function() {
				var $this = $(this);
				notify( on, $this.attr('name'), parseFloat( $this.val() ) / scale );
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

		$header.find( 'button.chart' )
				.on( 'click', function(){ $chart.toggleClass( 'visible' ); } )
				;
		$header.find( 'button.settings' )
				.on( 'click', function(){ $ctrl.toggleClass( 'visible' ); } )
				;

		$ctrl.find( 'section.runstop button' )
				.on( 'click', onClick( 'runstop' ) )
				;
		$ctrl.find( 'section.loadsave button' )
				.on( 'click', onClick( 'loadsave' ) )
				;

		var $secManual = $ctrl.find( 'section.manual' );
		$secManual.find( 'input.fill' )
				.on( 'change', onChangeFloat( 'manual', 100 ) );
		$secManual.find( 'input.temp' )
				.on( 'change', onChangeFloat( 'manual', 1 ) );
		$secManual.find( '[type="checkbox"]' )
				.on( 'change', onChangeCheckbox( 'manual' ) );

		var Controls = {

			init: function( element ) {

			},

			gotData: function( data ) {

				if( 'scripts' in data ) {

				}

			},

			onControl: function( onControl ) {

				_onControl = onControl;
			}
		}

		return Controls;
	}

})($);
