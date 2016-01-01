"use strict";

/**
 * Keep track of components
 *
 * Only single instance
 */
var BAG_Ctrl = (function($){

	var _com = false;
	var _controls = false;

	function gotManual( ev ) {

		_com( { action: "set", topic: "boiler" + ev.no + ev.ctrl, value: ev.value } );
	}

	function gotLoadSave( ev ) {
		console.debug( "loadsave", ev );
	}

	function gotRunStop( ev ) {
		console.debug( "runstop", ev );
	}

	var Ctrl = {

		init: function( controls ) {

			$.each( controls, function( name, control ){

				if( ! 'gotData' in control ) {
					console.warn( "Missing 'gotData'" );
				}

				if( 'onControl' in control ) {
					control.onControl( Ctrl.gotControl );
				}

			} );

			_controls = controls;

			return Ctrl;
		},

		gotData: function( data ) {

			//console.log( "gotData", data );

			if( !_controls ) return Ctrl;

			$.each( _controls, function( name, control ) {

				control.gotData( data );

			} );
		},

		gotControl: function( ev ) {

			switch( ev.on ) {

				case "manual": gotManual( ev ); break;
				case "loadsave": gotLoadSave( ev ); break;
				case "runstop": gotRunStop( ev ); break;
			}
			
		},

		onCom: function( com ) {

			_com = com;
		}

	};

	return Ctrl;

})($);
