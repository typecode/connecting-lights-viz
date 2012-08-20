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
		selector:'',
		on_timeout: false,
		n_generated: 500
	}, options);
	
	internal = {
		name:'Module.RandomMessageProvider',
		$e:(o.$e ? o.$e : $(o.selector)),
		callbacks: [],
		queued_messages: []
	};

	elements = {

	};

	fn = {
		init: function(){
			if(o.on_timeout){
				setTimeout(fn.random_message_timeout,(Math.random()*1000));
			}
			if(o.n_generated){
				fn.generate_messages(o.n_generated);
			}
		},
		random_message_timeout: function(){
			fn.generate_message();
			setTimeout(fn.random_message_timeout,(Math.random()*1000));
		},
		generate_messages: function(n_messages){
			var i;
			i = 0;
			while(i < n_messages){
				fn.generate_message();
				i++;
			}
		},
		generate_message: function(){
			var my_color;
			my_color = (new d3.hsl((Math.random()*360), 1, 0.60)).rgb();
			fn.message_added({
				color: 'rgba('+my_color.r+','+my_color.g+','+my_color.b+','+0.6+')',
				position_on_line: Math.random(0),
				//velocity: (Math.random() * 0.00001),
				velocity: 0.00001,
				lat_lng: null,
				layer: null
			});
		},
		message_added: function(message){
			var i;
			if(!internal.callbacks.length){
				internal.queued_messages.push(message);
				return;
			}
			for(i = 0; i < internal.callbacks.length; i++){
				if($.isFunction(internal.callbacks[i])){
					internal.callbacks[i](message);
				}
			}
		},
		register_callback: function(callback_function){
			var i, j;
			internal.callbacks.push(callback_function);
			if(internal.queued_messages.length){
				for(i = 0; i < internal.queued_messages.length; i++){
					for(j = 0; j < internal.queued_messages.length; j++){
						if($.isFunction(internal.callbacks[j])){
							internal.callbacks[j](internal.queued_messages[i]);
						}
					}
				}
			}
		}
	};

	handlers = {
		keypress: function(e, d){
			console.log(e.which);
			if(e.which == 103){ // 'p'
				fn.generate_messages(100);
			}
		}
	};

	jQuery(window).bind('keypress', {}, handlers.keypress);

	this.register_callback = fn.register_callback;

	fn.init();
};

