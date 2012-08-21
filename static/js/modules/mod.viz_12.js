var Viz_Twelve = function(options) {
		
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
		name:'Module.Viz_Twelve',
		$e:(o.$e ? o.$e : $(o.selector)),
		messages: [],
		animation_frame_id:null,
		message_provider: o.message_provider,
		stats: o.stats,
		point_mapper: o.point_mapper,
		particles_visible: true
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

			var center_lat_lon,
				image_sw_corner,
				image_ne_corner,
				image_bounds;
		
			var latlng = internal.point_mapper.map_position(0.5);

			mapOptions = {
				zoom: 9,
				minZoom: 9,
				center: new google.maps.LatLng(latlng[0], latlng[1]),
				mapTypeId: google.maps.MapTypeId.TERRAIN
			};

			internal.map = new google.maps.Map(document.getElementById('application'), mapOptions);

			google.maps.event.addListener(internal.map, 'bounds_changed', function() {
				fn.update_bounds(internal.map.getBounds());
			});

			google.maps.event.addListener(internal.map, 'dragend', function() {
				fn.update_bounds(internal.map.getBounds());
			});

			google.maps.event.addListener(internal.map, 'zoom_changed', fn.handle_zoom);

			image_sw_corner = new google.maps.LatLng(54.80, -3.25);
			image_ne_corner = new google.maps.LatLng(55.1, -1.40);
			image_bounds = new google.maps.LatLngBounds(image_sw_corner, image_ne_corner);
			internal.image_overlay = new GoogleImageOverlay(image_bounds,'static/img/image_overlay.png', internal.map);

			internal.message_provider.register_callback(fn.message_added);
			fn.handle_zoom();
		},

		setup_stats: function(){
			internal.stats.setMode(0); // 0: fps, 1: ms
			internal.stats.domElement.style.position = 'fixed';
			internal.stats.domElement.style.right = '0px';
			internal.stats.domElement.style.top = '0px';
			internal.stats.domElement.style.zIndex = '10000';
			document.body.appendChild( internal.stats.domElement );
		},

		message_added: function(message){
			message.lat_lng = internal.point_mapper.map_position(message.position_on_line);
			message.lat_lng = new google.maps.LatLng(message.lat_lng[0], message.lat_lng[1]);
			message.marker = new GoogleBalloonOverlay(message,internal.map, internal.map.getZoom() >= 12 ? true : false);
			internal.messages.push(message);
		},

		update_bounds: function(bounds){
			internal.point_mapper.set_bounds(bounds);
		},

		handle_zoom: function() {
			if(internal.map.getZoom() >= 12){
				fn.show_messages(function(){
					internal.image_overlay.hide();
				});
			} else {
				fn.hide_messages(function(){
					internal.image_overlay.show();
				});
				
			}
		},

		hide_messages: function(callback){
			var i;
			if(!internal.particles_visible){
				if($.isFunction(callback)){
					callback();
				}
				return;
			}
			for(i = 0; i < internal.messages.length; i++){
				internal.messages[i].marker.hide();
			}
			internal.particles_visible = false;
			if($.isFunction(callback)){
				callback();
			}
		},

		show_messages: function(callback){
			var i;
			if(internal.particles_visible){
				if($.isFunction(callback)){
					callback();
				}
				return;
			}
			for(i = 0; i < internal.messages.length; i++){
				internal.messages[i].marker.show();
			}
			internal.particles_visible = true;
			if($.isFunction(callback)){
				callback();
			}
		},

		update_particles: function(){
			var i, my_bounds, my_message, my_latlng;
			my_bounds = internal.map.getBounds();
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

				if(internal.particles_visible){
					my_latlng = internal.point_mapper.map_position(my_message.position_on_line);
					if(my_latlng){
						my_message.marker.setPosition(new google.maps.LatLng(my_latlng[0], my_latlng[1]));
					}
				}

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