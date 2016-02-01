"use strict";

BAG.Script_5Steps_Controls = (function($){

	return function( elem, device ) {

		var $elem = ( elem instanceof jQuery ? elem : $( elem ) ).expectOne(),
			$secProgram = $elem.find( 'section.program' ).expectOne()
			;

		function gotData( data ) {}

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
				steps: steps
			}

			return prog;
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

		return {

			name: '5steps',

			gotData: gotData,

			onControl: function( onControl ) {

				_onControl = onControl;
			},

			readScript: readScript,
			storeScript: storeScript,
			clearScript: clearScript

		}
	}
})($);
