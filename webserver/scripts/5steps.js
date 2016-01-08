"use strict";

var E = require( '../E.js' );

var SC = {
	heat: require( '../sc_heat.js' ),
	hold: require( '../sc_hold.js' ),
	pause: require( '../sc_pause.js' ),
	notify: require( '../sc_notify.js' )
};

module.exports = function( script, boiler, config, env ) {

	var _run = [],
		_idx = null,
	    _cur = null
		;

	function _exec( command ) {

		if( !_cur ) return E.rr( 'no _cur' );

		if( !_cur[ command ] ) return self.hello;

		var current = self.hello.current;

		current.mode = self.hello.mode;
		_cur[ command ]( current, boiler );
		self.hello.mode = current.mode;

		return self.hello;
	}

	var self = {

		_run: function(){ return _run },
		_idx: function(){ return _idx },
		_cur: function(){ return _cur },

		hello: {
			name: script.name,

			mode: "stop",
			start: 0,
			elapsed: 0,
			remaining: 0,

			steps: script.steps,

			current: null,

			actions: []
		},

		stepTo: function( index ) {

			if( index < 0 || index >= _run.length ) return false;

			_idx = index;
			_cur = _run[ index ];

			var current = {
				desc: 'not available',
				mode: 'stop',
				index: index,
				start: 0,
				elapsed: 0,
				remaining: 0
			};

			self.hello.current = current;

			return self.hello;
		},

		start: function(){
			if( ! self.stepTo( 0 ) ) return
			self.hello.start = env.time();
			self.hello.mode = 'run';
			return _exec( 'start' );
		},

		pause: function() {
			self.hello.mode = 'pause';
			return _exec( 'pause' );
		},
		resume: function() {
			self.hello.mode = 'run';
			return _exec( 'resume' );
		},
		stop: function() {
			self.hello.mode = 'stop';
			return _exec( 'stop' );
		},

		next: function() {
			if( _idx+1 >= _run.length ) return false;
			if( self.hello.mode == 'run' ) _exec( 'stop' );
			self.stepTo( _idx+1 );
			if( self.hello.mode == 'run' ) _exec( 'start' );
			return self.hello;
		},
		prev: function() {
			if( _idx-1 < 0 ) return false;
			if( self.hello.mode == 'run' ) _exec( 'stop' );
			self.stepTo( _idx+1 );
			if( self.hello.mode == 'run' ) _exec( 'start' );
			return self.hello;
		},

		run: function() {

			if( !_cur ) return;

			if( self.hello.current.mode == 'done' ) {
				self.next();
			}

			_exec( 'run' );

			// must be below because the parts above _exec could change these:
			var hello = self.hello,
				current = self.hello.current
				;
			
			var rem=0;
			rem += current.remaining;
			for( var i=_idx+1; i<_run.length; i++ ){
				if( _run[ i ].guessRuntime ) {
					rem += _run[ i ].guessRuntime( boiler );
				}
			}
			hello.remaining = rem;

			// possible actions
			var _actions = [];
			switch( hello.mode ) {
				case 'run': _actions.push( 'stop', 'pause' ); break;
				case 'pause': _actions.push( 'resume' ); break;
				case 'stop': _actions.push( 'start' ); break;
			}
			if( _idx > 0 ) _actions.push( 'prev' );
			if( _idx < _run.length -1 ) _actions.push( 'next' );

			hello.actions = _actions;

			return hello;
		},
	};

	var steps = script.steps;

	// for time calculation
	steps[ 0 ].from = 15;
	for( var i=1; i<5; i++ ){
		steps[ i ].from = steps[ i-1 ].heat;
	}

	// preheat
	_run.push( SC[ 'notify' ]( { what: 'run' }, config, env ) );
	_run.push( SC[ 'heat' ]( steps[ 0 ], config, env ) );

	// pause after preheat
	_run.push( SC[ 'notify' ]( { what: 'ready', msg: 'preheat done' }, config, env ) );
	_run.push( SC[ 'pause' ]( null, config, env ) );

	_run.push( SC[ 'notify' ]( { what: 'run' }, config, env ) );
	for( var i=1; i < 4; i++ ) {

		var step = script.steps[ i ];

		var sc_heat = SC[ 'heat' ]( step, config, env );
		_run.push( sc_heat );

		var sc_hold = SC[ 'hold' ]( step, config, env );
		_run.push( sc_hold );
	}

	// postheat
	_run.push( SC[ 'heat' ]( steps[ 4 ], config, env ) );

	_run.push( SC[ 'notify' ]( { what: 'done' }, config, env ) );

	// go to first step but don't start
	self.stepTo( 0 );
	self.hello.current.desc = 'Insert Coin';

	return self;
};

module.exports.version = 1;
