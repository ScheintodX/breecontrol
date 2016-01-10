var BAG_Config = function(){

	var self = {

		com: {
			//url: 'ws://10.3.2.1:8765/'
			//url: 'ws://10.64.50.4:8765/'
			url: 'ws://localhost:8765/',

			xxx: function() {
				self.url = "XXX";
			}
		}
	};

	return self;

}();
