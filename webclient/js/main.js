"use strict";

(function($){

	var ctrl = BAG.Ctrl( {} );
	
	var lastMessage = {};

	function loadDevice( $parent, device ) {

		console.trace( "LOAD", device.id );

		var id = device.id,
			$device = $( '<section class="tab device ' + device.type + '"/>' )
					.attr( 'id', id )
					.appendTo( $parent )
					.load( device.type + ".html", function() {
						ctrl.put( 'tab_'+id, BAG.Tab( $device, id ) );
						ctrl.put( 'info_'+id, BAG.Info( $device.find( '.info' ), id ) );
						ctrl.put( 'boiler_'+id, BAG.Boiler( $device.find( '.boiler' ), id ) );
						ctrl.put( 'boilerctrl_'+id, BAG.Boiler_Controls( $device, id ) );
						ctrl.put( 'fan_'+id, BAG.Fan( $device.find( '.fan' ), id ) );
						ctrl.put( 'ctrl_'+id, BAG.Script( $device, id ) );

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

			for( var i=0; i < data.config.devices.length; i++ ) {

				var device = data.config.devices[ i ];

				loadDevice( $main, device );
			}
		}

		ctrl.gotData( data );
	}

	function main() {

		var com = BAG.Com
			.onData( gotData )
			.start()
			;

		ctrl.onCom( com.send );
	}

	$(window).keydown(function(e) { if (e.keyCode == 123) debugger; });

	$(main);

})($);
