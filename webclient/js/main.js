"use strict";

(function($){

	function main( done ) {

		$('#ctrl1').children()
			.clone()
			.appendTo( $('#ctrl2') )
			;

		var ctrl = BAG_Ctrl( {

			ctrl1: BAG_Controls( '#t1', 'boiler1' ),
			//ctrl2: BAG_Controls( '#t2', 2 ),

			c1: BAG_Chart( '#t1 .chart', 'boiler1' ),
			//c2: BAG_Chart( '#c2', 2 ),

			b1: BAG_Boiler( '#t1 .boiler', 'boiler1' ),
			//b2: BAG_Boiler( '#b2', 2 ),

			info1: BAG_Info( '#t1 .info', 'boiler1' )
			//info2: BAG_Info( '#info2', 'boiler2' )
		} );

		var com = BAG_Com
			.onData( ctrl.gotData )
			.start()
			;

		ctrl.onCom( com.send );

		window.ctrl = ctrl;
	}

	$(main);

})($);
