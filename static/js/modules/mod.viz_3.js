

var Viz_Three = function(options) {
		
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
		name:'Module.Viz_Three',
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

		},

		setup_stats: function(){
			internal.stats.setMode(0); // 0: fps, 1: ms
			internal.stats.domElement.style.position = 'absolute';
			internal.stats.domElement.style.right = '0px';
			internal.stats.domElement.style.top = '0px';
			document.body.appendChild( internal.stats.domElement );
		},

		message_added: function(message){
			message.lat_lng = internal.point_mapper.map_position(message.position_on_line);
			message.layer = L.circle(message.lat_lng, 300, {
					stroke: false,
					fillColor: message.color,
					fillOpacity: 0.75
				}
			).addTo(internal.map);
			internal.messages.push(message);
		},

		update_particles: function(){
			var i, my_particle;
			for(i = 0; i < internal.messages.length; i++){
				my_particle = internal.messages[i];
				my_particle.position_on_line = my_particle.position_on_line + my_particle.velocity;
				if(my_particle.position_on_line < 0 || my_particle.position_on_line > 1){
					my_particle.velocity = my_particle.velocity * -1;
					if(my_particle.position_on_line < 0){
						my_particle.position_on_line = 0;
					}
					if(my_particle.position_on_line > 1){
						my_particle.position_on_line = 1;
					}
				}
				my_particle.lat_lng = internal.point_mapper.map_position(my_particle.position_on_line);
				my_particle.layer.setLatLng(my_particle.lat_lng);
			}
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
			internal.$e.css({
				'height': $(window).height() + 'px',
				'width': $(window).width() + 'px'
			});
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