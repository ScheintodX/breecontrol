import "../node_modules/jquery/dist/jquery.js";
import "./jqhelpers.js";

import BAG_Ctrl from "./ctrl.js";
import BAG_Com from "./com_ws.js";
import BAG_Tab from "./tab.js";
import BAG_Info from "./info.js";
import BAG_Script from "./script.js";

var ctrl = BAG_Ctrl( {} );

var lastMessage = {};

function loadDevice( $parent, device ) {

	var dId = device.id,
		dType = device.type,
		dModule = dType.substring( 0,1 ).toUpperCase() + dType.substring( 1 ),
		dControls = dModule + "_Controls"
		;

	console.info( "LOAD DEV", dId, dType, dModule, dControls );

	var $device = $( '<section class="tab device ' + dType + '"/>' )
			.attr( 'id', dId )
			.appendTo( $parent )
			.load( "devices/" + dType + ".html", function() {

				( async () => {

					var $info = $device.find( '.info' ),
						$dev = $device.find( '.' + dType ),
						$script = $device.find( 'section.script' )
						;

					// Tab
					ctrl.put( 'tab_'+dId, BAG_Tab( $device, dId ) );
					if( $info.length > 0 ) ctrl.put( 'info_'+dId, BAG_Info( $info, dId ) );
					try {
						var XMod = await import( "../devices/" + dModule.toLowerCase() + ".js");
						ctrl.put( dType + '_'+dId, XMod.default( $dev, dId ) );
						// if( BAG[ dModule ] ) ctrl.put( dType + '_'+dId, BAG[ dModule ]( $dev, dId ) );
					} catch( e ){
						if( e.code == "ERR_MODULE_NOT_FOUND" || e.code == "ERR_ABORTED" ){
							console.log( "MISSING MOD", dModule );
						} else {
							console.log( "XXX", e );
							throw e;
						}
					}
					try {
						var XCtrl = await import( "../devices/" + dControls.toLowerCase() + ".js" );
						ctrl.put( dType + 'ctrl_'+dId, XCtrl.default( $device, dId ) );
						// if( BAG[ dControls ] ) ctrl.put( dType + 'ctrl_'+dId, BAG[ dControls ]( $device, dId ) );
					} catch( e ){
						if( e.code == "ERR_MODULE_NOT_FOUND" || e.code == "ERR_ABORTED" ){
							console.log( "MISSING MOD", dModule );
						} else {
							console.log( "XXX", e );
							throw e;
						}
					}
					if( $script.length ) ctrl.put( 'ctrl_'+dId, BAG_Script( $device, dType, dId ) );

					// fix for elements to display scripts aren't ready when we get that kind of config/data.
					ctrl.gotData( lastMessage );
				} )();
			} );

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

		console.info( "CONFIG", data.config );

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

	var com = BAG_Com
		.onData( gotData )
		.start()
		;

	ctrl.onCom( com.send );
}

$(window).keydown(function(e) { if (e.keyCode == 123) debugger; });

$(main);

//setInterval( printBAG, 1000 );
