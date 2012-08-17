var Viz_Three = function(options) {
		
	var o, internal, elements, fn, handlers;
	
	o = $.extend({
		app:null,
		$e:null,
		selector:'',
		width: 600,
		height: 600,
		tileSize: 256,
		buffer: 5
	}, options);
	
	internal = {
		name:'Module.Viz_Three',
		$e:(o.$e ? o.$e : $(o.selector)),
		particles: [],
		animation_frame_id:null,
		point_mapper:{
			n_points: null,
			points: POINT_MAPPER_POINTS
		}
	};

	elements = {
		window: $(window),
		map: null,
		n_particles: $('#n-particles')
	};

	fn = {
		init: function(){
			internal.stats = new Stats();
			internal.stats.setMode(0); // 0: fps, 1: ms
			internal.stats.domElement.style.position = 'absolute';
			internal.stats.domElement.style.right = '0px';
			internal.stats.domElement.style.top = '0px';
			document.body.appendChild( internal.stats.domElement );

			internal.$e.css({
				'height': o.height + 'px',
				'width': o.width + 'px'
			});

			internal.map = L.map('application');

			fn.prepare_point_mapper();
			fn.generate_particles(500);

			wax.tilejson('http://a.tiles.mapbox.com/v3/zlieberm.ConnectingLights.jsonp', function(tilejson) {
				var wax_leaf;
				wax_leaf = new wax.leaf.connector(tilejson);
				wax_leaf.addTo(internal.map);
			});

			internal.map.setView([54.9839, -2.3291], 10);

		},

		prepare_point_mapper: function(){
			var i, total_distance, distance_thus_far;
			internal.point_mapper.n_points = internal.point_mapper.points.length;
			total_distance = 0;
			for(i = 0; i < internal.point_mapper.n_points; i++){
				if(i > 0){
					total_distance += fn.distance(internal.point_mapper.points[i-1], internal.point_mapper.points[i]);
				}
			}
			distance_thus_far = 0;
			for(i = 0; i < internal.point_mapper.n_points; i++){
				if(i > 0){
					distance_thus_far += fn.distance(internal.point_mapper.points[i-1], internal.point_mapper.points[i]);
				}
				internal.point_mapper.points[i].push(distance_thus_far/total_distance);
			}
		},

		distance: function(point1, point2){
			var xs, ys;
			
			xs = point2[0] - point1[0];
			xs = xs * xs;
			
			ys = point2[1] - point1[1];
			ys = ys * ys;
			
			return Math.sqrt( xs + ys );
		},

		generate_particles: function(n_particles){
			var i, my_color, my_particle;

			for(i = 0; i < n_particles; i++){
				my_color = (new d3.hsl((Math.random()*360), 1, 0.60)).rgb();
				my_particle = {
					color: 'rgba('+my_color.r+','+my_color.g+','+my_color.b+','+0.6+')',
					lat_lng: null,
					position_on_line: Math.random(0),
					velocity: (Math.random() * 0.00001),
					layer: null
				};
				my_particle.lat_lng = fn.map_position(my_particle.position_on_line);
				my_particle.layer = L.circle(my_particle.lat_lng, 300, {
						stroke: false,
						fillColor: my_particle.color,
						fillOpacity: 0.75
					}
				).addTo(internal.map);
				internal.particles.push(my_particle);
			}
		},

		update_particles: function(){
			var i, my_particle;
			for(i = 0; i < internal.particles.length; i++){
				my_particle = internal.particles[i];
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
				my_particle.lat_lng = fn.map_position(my_particle.position_on_line);
				my_particle.layer.setLatLng(my_particle.lat_lng);
			}
		},

		map_position: function(pct){
			var i, lat_lng, points, pta, ptb;

			points = internal.point_mapper.points;

			for(i = 0; i < (internal.point_mapper.n_points - 1); i++){
				if( pct >= internal.point_mapper.points[i][2] && pct <= internal.point_mapper.points[i+1][2]){
					pta = i;
					ptb = i + 1;
					break;
				}
			}

			if(points[pta] && points[ptb]){
				pct_between = (pct - points[pta][2]) / (points[ptb][2] - points[pta][2]);
				
				lat_lng = new L.LatLng(
					points[pta][1] + ((pct_between) * (points[ptb][1] - points[pta][1])),
					points[pta][0] + ((pct_between) * (points[ptb][0] - points[pta][0]))
				);
			} else {
				lat_lng = new L.LatLng(
					points[pta][1],
					points[pta][0]
				);
			}
			return lat_lng;
			

			
		},

		drawTile: function(canvas, tilePoint, zoom){

			var ctx, bounds, particles_to_draw, i, my_image_data;

			ctx = {
				map: this._map,
				canvas: canvas,
				context: canvas.getContext('2d'),
				tile: tilePoint,
				zoom: zoom
			};

			bounds = fn.get_canvas_bounds(ctx, o.buffer);
			particles_to_draw = fn.get_particles_for_bounds(bounds);

			ctx.context.clearRect (0,0, ctx.canvas.width, ctx.canvas.height);
			for(i = 0; i < particles_to_draw.length; i++){
				fn.draw_particle(ctx, particles_to_draw[i]);

			}
		},

		get_canvas_bounds: function(ctx, buf){
			//potentially a slow function - look at caching it on the canvas object?


			var nwPoint, sePoint, diff, nwCoord, seCoord, swLatLng, neLatLng, bounds;
		
			nwPoint = ctx.tile.multiplyBy(o.tileSize);
			sePoint = nwPoint.add(new L.Point(o.tileSize, o.tileSize));

			// optionally, enlarge request area.
			// with this I can draw points with coords outside this tile area,
			// but with part of the graphics actually inside this tile.
			// NOTE: that you should use this option only if you're actually drawing points!
			if (buf > 0) {
				diff = new L.Point(buf, buf);
				nwPoint = nwPoint.subtract(diff);
				sePoint = sePoint.add(diff);
			}

			nwCoord = ctx.map.unproject(nwPoint, ctx.zoom, true);
			seCoord = ctx.map.unproject(sePoint, ctx.zoom, true);

			swLatLng = new L.LatLng(seCoord.lat, nwCoord.lng);
			neLatLng = new L.LatLng(nwCoord.lat, seCoord.lng);
			bounds = new L.LatLngBounds(swLatLng, neLatLng);
			
			return bounds;
		},

		get_particles_for_bounds: function(bounds){
			var i, output;
			output = [];
			for(i = 0; i < internal.particles.length; i++){
				
				if(internal.particles[i].lat_lng && bounds.contains(internal.particles[i].lat_lng)){
					output.push(internal.particles[i]);
				}
			}
			return output;
		},

		draw_particle: function(ctx, particle){
			var style, geom, i;
			style = {
				color: particle.color,
				radius: 5
			};
			geom = particle.lat_lng;
			fn.draw_dot(style, ctx, geom);
		},

		draw_dot: function(style, ctx, geom){
			var p, c, g;
			p = this.get_tile_point(ctx, geom);
			c = ctx.canvas;
			g = ctx.context;
			g.beginPath();
			g.fillStyle = style.color;
			g.arc(p.x, p.y, style.radius, 0, Math.PI * 2);
			g.closePath();
			g.fill();
			g.restore();
		},

		get_tile_point: function(ctx, coords){
			// start coords to tile 'space'
			var s = ctx.tile.multiplyBy(o.tileSize);

			// actual coords to tile 'space'
			var p = ctx.map.project(coords);

			// point to draw
			var x = Math.round(p.x - s.x);
			var y = Math.round(p.y - s.y);
			return {
				x: x,
				y: y
			};
		},

		add_json_layers: function(){
			if(o.draw_hadrians_wall){
				jQuery.getJSON('static/data/hadrians-wall.json', function(d){
					L.geoJson(d, {
						style: function (feature) {
							return {
								"color": "#ff7800",
								"weight": 5,
								"opacity": 0.65
							};
						},
						onEachFeature: function (feature, layer) {
							layer.bindPopup(feature.properties.description);
						}
					}).addTo(internal.map);
				});
			}
				

			if(o.draw_balloons){
				jQuery.getJSON('static/data/balloons/output.json', function(d){
					L.geoJson(d, {
						style: function (feature) {
							return {
								"color": "#ff7800",
								"weight": 5,
								"opacity": 0.65
							};
						},
						onEachFeature: function (feature, layer) {
							layer.bindPopup(feature.properties.description);
						}
					}).addTo(internal.map);
				});
			}
		},

		animate: function(frame_time){
			var delta;
			delta = frame_time - internal.last_frame;
			internal.last_frame = frame_time;
			internal.stats.begin();
			internal.animation_frame_id = requestAnimationFrame( fn.animate );
			fn.draw(delta);
		},

		draw: function(){
			fn.update_particles();
			//internal.canvasTiles.redraw();
			//internal.canvasTiles.bringToFront();
			internal.stats.end();
			elements.n_particles.text(internal.particles.length);
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
			} else if(e.which == 103){ // 'g'
				fn.generate_particles(10);
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