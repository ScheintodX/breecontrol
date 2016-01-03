"use strict";

var BAG_Button = function($){

	function InputCheckbox( $e, topic ) {

		function trigger() {
			self.notify( 'manual', topic, $e.prop('checked') );
		}

		$e.on( 'click', function( val ) {
			$e.prop( 'disabled', true );
			trigger();
			return false;
		} );

		var self = Notifyable( Overridable( Automatic( {
			$e: $e,
			topic: topic,
			trigger: trigger,
			set: function( val ) {
				var checked = (val==1);
				$e.prop( {
					checked: checked,
					disabled: false
				} );
				return self;
			},
		} ) ) );

		return self;
	}

	function InputNumber( $e, topic, scale ) {

		if( !scale ) scale = 1;

		var edit = false
			;

		function trigger() {
			self.notify( 'manual', topic, parseFloat( $e.val() ) / scale );
		}

		$e.on( 'change', trigger )
		  .on( 'focus', function() { edit=true; } )
		  .on( 'focusout', function() { edit=false; } )


		var self = Notifyable( Overridable( Automatic( {
			$e: $e,
			topic: topic,
			trigger: trigger,
			set: function( val ) {
				if( edit ) return;
				if( typeof val == 'undefined' ){
					$e.val( '' );
				} else {
					$e.val( val * scale );
				}
				return self;
			}
		} ) ) );

		return self;
	}

	function Notifyable( what ) {
		
		what.notify = false,
		what.onNotify = function( callback ){
			what.notify = callback;
			return what;
		}
		return what;
	}

	function Automatic( what ) {

		what.auto = function() {
			return Auto( what );
		}
		return what;
	}

	function Overridable( what ) {

		what.override = function() {
			return Override( what );
		}
		return what;
	}

	function Auto( button ) {
		
		console.log( "AUTO", button.topic );

		var $auto = $('<button class="auto" value="on">auto</button>')
				.addClass( button.topic )
				.on( 'click', function() {
					$auto.togOn();
					buttonSet();
				} )
				.insertAfter( button.$e )
				;
		console.log( $auto );


		button.$auto = $auto;

		var buttonSet = button.set;
		button.set = function( val ) {
			if( ! $auto.isOn() ) return;
			buttonSet( val );
			return button;
		}
		var buttonNotify = button.notify;
		button.notify = function( on, topic, data ) {
			$auto.setOn( false );
			buttonNotify( on, topic, data );
		}

		return button;
	}

	function Override( button ) {

		console.log( "OVERRIDE", button.topic );

		var buttonSet = button.set;
		var buttonNotify = button.notify;

		var $override = $('<button class="overridable" value="off">override</button>')
				.addClass( button.topic )
				.on( 'click', function() {
					$override.togOn();
					if( $override.isOn() ) {
						button.trigger();
					} else {
						buttonNotify( 'manual', button.topic );
					}
				} )
				.insertAfter( button.$e )
				;

		button.$override = $override;

		button.set = function( val ) {
			if( ! $override.isOn() ) return;
			buttonSet( val );
			return button;
		}
		button.notify = function( on, topic, data ) {
			$override.setOn( true );
			buttonNotify( on, topic, data );
		}


		return button;
	}

	var self = function( type, $e, topic, scale ) {
		console.log( type, topic );
		switch( type ){
			case 'number': return InputNumber( $e, topic, scale );
			case 'checkbox': return InputCheckbox( $e, topic, scale );
			default: throw "Unsupported type: " + type;
		}
	
	}
	self.InputCheckbox = InputCheckbox;
	self.InputNumber = InputNumber;

	return self;

}($);
