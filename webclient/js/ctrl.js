"use strict";

/**
 * Keep track of components
 *
 * Only single instance
 */
var BAG_Ctrl = (function($){

	return function( controls ) {

		var _com = false;

		function gotManual( ev ) {

			_com( { on: "set", topic: ev.device + ev.topic, value: ev.value } );
		}

		function gotLoadSave( ev ) {

			_com( ev );
		}

		function gotRunStop( ev ) {

			_com( ev );
		}

		function gotData( data ) {

			if( !controls ) return Ctrl;

			$.each( controls, function( name, control ) {

				control.gotData( data );

			} );
			return Ctrl;
		}

		function gotControl( ev ) {

			switch( ev.on ) {

				case "manual": gotManual( ev ); break;
				case "loadsave": gotLoadSave( ev ); break;
				case "runstop": gotRunStop( ev ); break;
			}
			return Ctrl;
		}

		$.each( controls, function( name, control ){

			if( ! 'gotData' in control ) {
				console.warn( "Missing 'gotData'" );
			}

			if( 'onControl' in control ) {
				control.onControl( gotControl );
			}

		} );

		var Ctrl = {

			controls: controls,

			gotData: gotData,

			gotControl: gotControl,

			onCom: function( com ) {

				_com = com;
			}

		};

		return Ctrl;
	}

})($);
