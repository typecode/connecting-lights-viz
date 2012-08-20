var Viz_Six = function(options) {
		
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
		
			var cloudmadeUrl = 'http://a.tiles.mapbox.com/v3/zlieberm.map-gt6pmdco/{z}/{x}/{y}.png',
				cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
				cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution}),
				latlng = internal.point_mapper.map_position(0.5), //new L.LatLng(54.971671, -2.325199),
				bounds = new L.LatLngBounds(new L.LatLng(55.50206, -4.502565), new L.LatLng(53.989347, -0.748958));

			internal.map = new L.Map('application', {center: latlng, zoom: 6, layers: [cloudmade], maxBounds: bounds});
			internal.message_provider.register_callback(fn.message_added);
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
			message.marker = new ImageOverlay(message);
			internal.map.addLayer(message.marker);
			internal.messages.push(message);
		},

		update_particles: function(){
			var i, my_bounds, my_particle;
			my_bounds = internal.map.getBounds();
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
				my_particle.marker._latlng = internal.point_mapper.map_position(my_particle.position_on_line);
				if(my_bounds.contains(my_particle.marker._latlng)){
					my_particle.marker.update();
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