"use strict";

BAG.Function = ( function(){

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

				var X = [
						[   0,   0,   0 ],
						[ 233,   0,   0 ],
						[ 244, 235,  80 ],
						[ 255, 251, 200 ],
						[ 174, 255, 246 ]
				];

				function d2h( c ) {
					var hex = (c<<0).toString(16);
					return hex.length == 1 ? "0" + hex : hex;
				}
				function col( c ){
					return '#' + d2h(c[0]) + d2h(c[1]) + d2h(c[2]);
				}
				function mix( c1, c2, val ) {
					return col([
							c1[0] * (1-val) + c2[0]*val,
							c1[1] * (1-val) + c2[1]*val,
							c1[2] * (1-val) + c2[2]*val
					]);
				}
				return function( heat ) {

					var color;
					if( heat <=0 ) color = col( X[0] );
					else if( heat < 100 ) color = mix( X[0], X[1], heat/100.0 );
					else if( heat < 200 ) color = mix( X[1], X[2], (heat-100)/100.0 );
					else if( heat < 300 ) color = mix( X[2], X[3], (heat-200)/100.0 );
					else if( heat < 400 ) color = mix( X[3], X[4], (heat-300)/100 );
					else color = col( X[3] );
					return f( color );
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
