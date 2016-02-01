"use strict";

(function($){

	var ctrl = BAG_Ctrl( {} );
	
	var lastMessage = {};

	function loadDevice( $parent, device, idx ) {

		var id = 'boiler' + idx,
			$device = $( '<section class="tab ' + device.type + '"/>' )
					.attr( 'id', id )
					.appendTo( $parent )
					.load( device.type + ".html", function() {

						console.log( $device );

						ctrl.put( 'tab'+idx, BAG_Tab( $device, id ) );
						ctrl.put( 'info'+idx, BAG_Info( $device.find( '.info' ), id ) );
						ctrl.put( 'boiler'+idx, BAG_Boiler( $device.find( '.boiler' ), id ) );
						ctrl.put( 'boilerctrl'+idx, BAG_Boiler_Controls( $device, id ) );
						ctrl.put( 'ctrl'+idx, BAG_Script( $device, id ) );

						// fix for elements to display scripts aren't ready when we get that kind of config/data.
						ctrl.gotData( lastMessage );
					} )
					
	}

	function gotData( data ) {

		// store config for data we receive before controls are loaded.
		if( 'scripts' in data ) {
			lastMessage.scripts = data.scripts;
		}
		if( 'config' in data ) {
			lastMessage.config = data.config;
		}

		if( 'config' in data ) {

			var $main = $('main');

			$main.empty();

			for( var i=0; i < data.config.boilers.length; i++ ) {

				var device = data.config.boilers[ i ];

				loadDevice( $main, device, (i+1) );
			}
		}

		ctrl.gotData( data );
	}

	function main() {

		var com = BAG_Com
			.onData( gotData )
			.start()
			;

		ctrl.onCom( com.send );
	}

	$(window).keydown(function(e) { if (e.keyCode == 123) debugger; });

	$(main);

})($);
