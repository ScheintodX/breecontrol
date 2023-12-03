"use strict";

/**
 * Keep track of components
 *
 * Only single instance
 */
BAG.Ctrl = (function($){

	return function( controls ) {

		var _com = false;
		var _last;

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

			//console.log( data );

			if( 'devices' in data ) {
				_last = data;
			}
			if( 'diff' in data && 'devices' in data.diff && _last ) {
				_last = jsondiffpatch.patch( _last, data.diff );
				data = _last;
			}

			$.each( controls, function( name, control ) {

				if( control.gotData ) control.gotData( data );

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

		function initControl( name, control ) {

			if( ! 'gotData' in control ) {
				console.warn( "Missing 'gotData'" );
			}

			if( 'onControl' in control ) {
				control.onControl( gotControl );
			}
		}

		$.each( controls, initControl );

		var Ctrl = {

			controls: controls,

			gotData: gotData,
			gotControl: gotControl,

			onCom: function( com ) {

				_com = com;
			},

			put: function( id, control ) {

				initControl( id, control );

				controls[ id ] = control;
			}

		};

		return Ctrl;
	}

})($);
