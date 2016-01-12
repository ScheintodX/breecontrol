"use strict";

var BAG_Function = ( function(){

	return function( svg ){
	
		var ψ = {

			ifchanged: function( f ) {
				var _old;
				return function( val ) {
					if( _old === val ) return;
					_old = val;
					f( val );
				}
			},

			text: function( id ) {
				return ψ.ifchanged( function( text ) {
					var svgE = svg( id );
					if( svgE ) svgE.children[ 0 ].textContent = text;
				} );
			},

			asDegree: function( f, inclC, scale ) {

				if( !scale ) scale = 1;

				return function( val ) {
					var text;
					if( val !== 0 && !val ) text = '??';
					else {
						text = val.toTemp( scale );
						if( inclC ) text += 'C';
					}
					return f( text );
				}
			},

			asHourMinSec: function( f ) {

				return function( val ) {
					var text;
					if( ! val ) text = '--:--:--';
					else {
						text = val.toHourMinSec()
					}
					return f( text );
				}
			},

			asMinSec: function( f ) {

				return function( val ) {
					var text;
					if( ! val ) text = '--:--';
					else {
						text = val.toMinSec()
					}
					return f( text );
				}
			},

			asColor: function( f ) {

				function d2h(c) {
					var hex = (c<<0).toString(16);
					return hex.length == 1 ? "0" + hex : hex;
				}
				function col( r,g,b ){
					return '#' + d2h(r) + d2h(g) + d2h(b);
				}

				return function( heat ) {

					var color = '#000000';
					if( heat !== 0 && !heat ) color='#77ff00';
					else {
						if( heat < 300 ){
							var perc = (heat/300);
							color = col( perc*255, perc*127, 0 );
						} else color = '#ffdd88';
					}
					f( color );
				}
			},

			fill: function( id ) {
				return ψ.ifchanged( function( color ) {
					var svgE = svg( id );
					if( svgE ) svgE.style.fill = color;
				} );
			},

			border: function( id ) {
				return ψ.ifchanged( function( on ) {
					var svgE = svg( id );
					if( svgE ) svgE.style.stroke = on ? '#ef2929' : '#2e3436';
				} );
			},

			opacity: function( id ) {
				return ψ.ifchanged( function( value ) {
					var svgE = svg( id );
					if( svgE ) svgE.style.opacity = value;
				} );
			},

			visible: function( id ) {
				return ψ.ifchanged( function( visible ) {
					var svgE = svg( id );
					if( svgE ) svgE.style.opacity = visible ? 1 : 0;
				} );
			},

			oneOf: function( prefix, list ) {
				return ψ.ifchanged( function( which ) {
					$.each( list, function( i, it ) {
						var svgE = svg( prefix + it );
						if( svgE ) svgE.style.opacity = (which==it) ? 1 : 0;
					} );
				} )
			},

			override: function( f ) {
				return function( value ) {
					var isOverride = (
							typeof value != 'undefined' 
							&& value !== null
							&& value != 'off'
					);
					return f( isOverride );
				};
			}

		};

		return ψ;
		
	};

} )();
