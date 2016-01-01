"use strict";

(function($){

	function main() {

		$('#ctrl1').children()
			.clone()
			.appendTo( $('#ctrl2') )
			;

		BAG_Usability( $('body') );

		var ctrl = BAG_Ctrl.init( {

			b1: BAG_Boiler( '#b1', 1 ),
			b2: BAG_Boiler( '#b2', 2 ),

			c1: BAG_Chart( '#c1', 1 ),
			c2: BAG_Chart( '#c2', 2 ),

			ctrl1: BAG_Controls( '#t1', 1 ),
			ctrl2: BAG_Controls( '#t2', 2 )
		} );


		var com = BAG_Com
			.onData( ctrl.gotData )
			.start()
			;

		ctrl.onCom( com.send );
	}

	$(main);

})($);
