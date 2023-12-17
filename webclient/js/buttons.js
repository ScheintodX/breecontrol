"use strict";

BAG.Control = function($){

	function InputCheckbox( $e, topic ) {

		function trigger() {
			self.notify( 'manual', topic, $e.prop('checked') );
		}

		$e.on( 'click', function( val ) {
			$e.prop( 'disabled', true );
			trigger();
			return false;
		} );

		var self = Notifyable( Overridable( {
			$e: $e,
			topic: topic,
			trigger: trigger,
			set: function( val ) {
				var checked = !!(val.set);
				$e.prop( {
					checked: checked,
					disabled: false
				} );
				return self;
			},
		} ) );

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
				.on( 'keypress', function( ev ) {
					var code = ev.keyCode || e.which;
					if( ev.keyCode == 13 ) {
						$e.blur();
						trigger();
					}
				} )
				;

		var self = Notifyable( Overridable( {
			$e: $e,
			topic: topic,
			trigger: trigger,
			set: function( val ) {
				if( edit ) return;
				if( typeof val == 'undefined' ){
					$e.val( '' );
				} else {
					val = val.set;
					$e.val( val * scale );
				}
				return self;
			}
		} ) );

		return self;
	}

	function InputSelect( $e, topic ) {

		function trigger() {
			self.notify( 'manual', topic, $e.val() );
		}

		$e.on( 'change', function( val ) {

			trigger();
			return false;
		} );

		var self = Notifyable( Overridable( {
			$e: $e,
			topic: topic,
			trigger: trigger,
			set: function( val ) {
				$e.val( val );
			}
		} ) );

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

	function Overridable( what ) {

		what.override = function() {
			return Override( what );
		}
		return what;
	}

	function Override( button ) {

		var buttonSet = button.set;
		var buttonNotify = button.notify;

		var $override = $('<button class="override" value="off">override</button>')
				.addClass( button.topic )
				.on( 'click', function() {
					$override.togOn();
					if( $override.isOn() ) {
						button.trigger();
					} else {
						buttonNotify( 'manual', button.topic, null );
					}
				} )
				.insertAfter( button.$e )
				;

		button.$override = $override;

		button.set = function( val ) {

			if( typeof val == 'undefined' || val === null || val === 'off' ) {
				$override.setOn( false );
				buttonSet( undefined );
			} else {
				$override.setOn( true );
				buttonSet( val );
			}

			return button;
		}
		button.notify = function( on, topic, data ) {
			$override.setOn( true );
			buttonNotify( on, topic, data );
		}


		return button;
	}

	var self = function( $e, topic, scale ) {
		var tag = $e.prop( 'nodeName' );
		var type = $e.attr( 'type' );
		switch( tag ) {
			case 'INPUT':
			switch( type ){
				case 'number': return InputNumber( $e, topic, scale );
				case 'checkbox': return InputCheckbox( $e, topic, scale );
				default: throw "Unsupported type: " + type;
			}
			break;
			case 'SELECT':
				return InputSelect( $e, topic, scale );
			break;
			default:
				console.warn( "Unknown: " + tag );
		}

	}
	self.InputCheckbox = InputCheckbox;
	self.InputNumber = InputNumber;
	self.InputSelect = InputSelect;

	return self;

}($);
