

var Viz_Four = function(options) {
		
	var o, internal, elements, fn, handlers;
	
	o = $.extend({
		app:null,
		$e:null,
		selector:'',
		width: 600,
		height: 600,
		tileSize: 256,
		buffer: 5,
		message_provider: new RandomMessageProvider({}),
		point_mapper: new PointMapper({}),
		stats: new Stats()
	}, options);
	
	internal = {
		name:'Module.Viz_Four',
		$e:(o.$e ? o.$e : $(o.selector)),
		messages: [],
		animation_frame_id:null,
		message_provider: o.message_provider,
		stats: o.stats,
		point_mapper: o.point_mapper
	};

	elements = {
		window: $(window),
		map: null,
		viz: null,
		n_particles: $('#n-particles')
	};

	fn = {
		init: function(){
			fn.setup_stats();

			internal.$e.css({
				'height': o.height + 'px',
				'width': o.width + 'px'
			});

			internal.message_provider.register_callback(fn.message_added);

			internal.map = L.map('application');
			wax.tilejson('http://a.tiles.mapbox.com/v3/zlieberm.ConnectingLights.jsonp', function(tilejson) {
				var wax_leaf;
				wax_leaf = new wax.leaf.connector(tilejson);
				wax_leaf.addTo(internal.map);
			});
			internal.map.setView([54.9839, -2.3291], 10);

			internal.viz = $(internal.map.getPanes().overlayPane).append('<div id="viz_layer"></div>');

			internal.map.on("viewreset", fn.reset);
			fn.reset();
		},

		setup_stats: function(){
			internal.stats.setMode(0); // 0: fps, 1: ms
			internal.stats.domElement.style.position = 'fixed';
			internal.stats.domElement.style.right = '0px';
			internal.stats.domElement.style.top = '0px';
			document.body.appendChild( internal.stats.domElement );
		},

		message_added: function(message){
			message.lat_lng = internal.point_mapper.map_position(message.position_on_line);
			message.point = fn.project(message.lat_lng);
			message.$e = internal.viz.append('<div class="balloon"></div>');
			internal.messages.push(message);
		},

		update_particles: function(){
			var i, my_message;
			for(i = 0; i < internal.messages.length; i++){
				my_message = internal.messages[i];
				my_message.position_on_line = my_message.position_on_line + my_message.velocity;
				if(my_message.position_on_line < 0 || my_message.position_on_line > 1){
					my_message.velocity = my_message.velocity * -1;
					if(my_message.position_on_line < 0){
						my_message.position_on_line = 0;
					}
					if(my_message.position_on_line > 1){
						my_message.position_on_line = 1;
					}
				}
				my_message.lat_lng = internal.point_mapper.map_position(my_message.position_on_line);
				my_message.point = fn.project(my_message.lat_lng);
				console.log(my_message.point);
			}
		},

		project: function(x){
			var point = internal.map.latLngToLayerPoint(new L.LatLng(x['lat'], x['lng']));
			return [point.x, point.y];
		},

		reset: function(){
		//	var bottomLeft = fn.project(bounds[0]),
		//		topRight = fn.project(bounds[1]);

		//	internal.viz.attr("width", topRight[0] - bottomLeft[0])
		//		.attr("height", bottomLeft[1] - topRight[1])
		//		.style("margin-left", bottomLeft[0] + "px")
		//		.style("margin-top", topRight[1] + "px");
		},

		animate: function(frame_time){
			internal.stats.begin();
			internal.animation_frame_id = requestAnimationFrame( fn.animate );
			fn.draw();
		},

		draw: function(){
			fn.update_particles();
			internal.stats.end();
			elements.n_particles.text(internal.messages.length);
		}
	};

	handlers = {
		keypress: function(e, d){
			console.log(e.which);
			if(e.which == 112){ // 'p'
				if(internal.animation_frame_id){
					cancelAnimationFrame(internal.animation_frame_id);
					internal.animation_frame_id = null;
				} else {
					internal.animation_frame_id = requestAnimationFrame(fn.animate);
				}
			}
		},
		resize: function(){
		//	internal.$e.css({
		//		'height': $(window).height() + 'px',
		//		'width': $(window).width() + 'px'
		//	});

		//	internal.viz.css({
		//		'height': $(window).height() + 'px',
		//		'width': $(window).width() + 'px'
		//	});
		}
	};

	jQuery(window).bind('keypress', {}, handlers.keypress);
	jQuery(window).bind('resize', {}, handlers.resize);

	o.app.events.bind('app.featuresInitialized', {}, function(){
		fn.init();
		fn.animate();
	});
	
	console.log(internal);

};