const self = {

	loader: function( name ) { // implizit async

		var file = name.toLowerCase() + ".js";
		console.log( "LOAD Js", file );

		return import( "../scripts/" + file )
				.then( M => M.default );
	},

	loaderHtml: function( name ){ // implizit async

		var file = name.toLowerCase() + ".html";
		console.log( "LOAD Html", file );

		return fetch( "scripts/" + file ).then( resp => resp.text() );
	},

	loadModule: function( name, done ) { // implizit async

		console.log( "LOAD Module", name );

		return Promise.all( [

				self.loaderHtml( name ),
				self.loader( name + "_Controls" ),
				self.loader( name + "_Chart" )

		] ).then( (res) => ({
			html: res[ 0 ],
			Controls: res[ 1 ],
			Chart: res[ 2 ]
		}) );
	}
};

export default self;
