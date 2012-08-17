var MessageProvider = function(options){

	var o, internal, elements, fn, handlers;
	
	o = $.extend({
		app:null,
		$e:null,
		selector:''
	}, options);
	
	internal = {
		name:'Module.MessageProvider',
		$e:(o.$e ? o.$e : $(o.selector))
	};

	elements = {

	};

	fn = {
		message_added: function(message){
			var i;
			for(i in internal.callbacks){
				if($.isFunction(internal.callbacks[i])){
					internal.callbacks[i](message);
				}
			}
		},
		register_callback: function(callback_function){
			internal.callbacks.push(callback_function);
		}
	};

	fn.init();
};


var RandomMessageProvider = function(options){

	var o, internal, elements, fn, handlers;
	
	o = $.extend({
		app:null,
		$e:null,
		selector:''
	}, options);
	
	internal = {
		name:'Module.RandomMessageProvider',
		$e:(o.$e ? o.$e : $(o.selector)),
		callbacks: []
	};

	elements = {

	};

	fn = {
		init: function(){
			setTimeout(fn.generate_message, (Math.random()*1000));
			fn.register_callback(function(){
				setTimeout(fn.generate_message, (Math.random()*1000));
			});
		},
		generate_message: function(){
			var my_color;
			
			my_color = (new d3.hsl((Math.random()*360), 1, 0.60)).rgb();
			fn.message_added({
				color: 'rgba('+my_color.r+','+my_color.g+','+my_color.b+','+0.6+')',
				position_on_line: Math.random(0),
				velocity: (Math.random() * 0.00001),
				
				lat_lng: null,
				layer: null
			});
		},
		message_added: function(message){
			var i;
			for(i in internal.callbacks){
				if($.isFunction(internal.callbacks[i])){
					internal.callbacks[i](message);
				}
			}
		},
		register_callback: function(callback_function){
			internal.callbacks.push(callback_function);
		}
	};

	this.register_callback = fn.register_callback;

	fn.init();
};

