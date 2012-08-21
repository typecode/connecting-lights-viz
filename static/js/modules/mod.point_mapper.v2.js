var PointMapper = function(options){

	var o, internal, elements, fn, handlers;
	
	o = $.extend({
		app:null,
		$e:null,
		selector:''
	}, options);
	
	internal = {
		name:'Module.PointMapper',
		$e:(o.$e ? o.$e : $(o.selector)),
		n_points: null,
		points: POINT_MAPPER_POINTS,
		bounds: null,
		min_max_position: null
	};

	elements = {
		
	};

	fn = {
		init: function(){
			fn.prepare_point_mapper();
		},

		prepare_point_mapper: function(){
			var i,
				total_distance,
				distance_thus_far,
				bounds;

			internal.n_points = internal.points.length;
			total_distance = 0;
			for(i = 0; i < internal.n_points; i++){
				if(i > 0){
					total_distance += fn.distance(internal.points[i-1], internal.points[i]);
				}
			}
			distance_thus_far = 0;
			min_max = {
				name: 'Hadrians Wall Bounds',
				n:null,
				s:null,
				e:null,
				w:null
			};
			for(i = 0; i < internal.n_points; i++){
				if(i > 0){
					distance_thus_far += fn.distance(internal.points[i-1], internal.points[i]);
				}

				if(!min_max.n){
					min_max.n = internal.points[i][1];
				} else {
					if(internal.points[i][1] > min_max.n){
						min_max.n = internal.points[i][1];
					}
				}
				if(!min_max.s){
					min_max.s = internal.points[i][1];
				} else {
					if(internal.points[i][1] < min_max.s){
						min_max.s = internal.points[i][1];
					}
				}
				if(!min_max.e){
					min_max.e = internal.points[i][0];
				} else {
					if(internal.points[i][0] > min_max.e){
						min_max.e = internal.points[i][0];
					}
				}
				if(!min_max.w){
					min_max.w = internal.points[i][0];
				} else {
					if(internal.points[i][0] < min_max.w){
						min_max.w = internal.points[i][0];
					}
				}

				internal.points[i].push(distance_thus_far/total_distance);
			}

			console.log(min_max);
		},

		distance: function(point1, point2){
			var xs, ys;
			
			xs = point2[0] - point1[0];
			xs = xs * xs;
			
			ys = point2[1] - point1[1];
			ys = ys * ys;
			
			return Math.sqrt( xs + ys );
		},

		set_bounds: function(bounds){
			var lowest_visible, highest_visible;
			lowest_visible = null;
			highest_visible = null;
			for(i = 0; i < internal.points.length; i++){
				if(internal.points[i][0] > bounds.getSouthWest().lng() && !lowest_visible){
					if(i === 0){
						lowest_visible = 0;
					} else {
						lowest_visible = internal.points[i][2];
					}
				}
				if(internal.points[i][0] > bounds.getNorthEast().lng() && !highest_visible){
					highest_visible = internal.points[i][2];
				}
			}
			internal.min_max_position = {
				min: lowest_visible ? lowest_visible : internal.points[0][2],
				max: highest_visible ? highest_visible : internal.points[internal.points.length-1][2]
			};
		},

		map_position: function(pct){
			var i, lat_lng, points, pta, ptb;
			
			if(internal.min_max_position && (pct <= internal.min_max_position.min || pct >= internal.min_max_position.max)){
				return false;
			}

			points = internal.points;

			for(i = 0; i < (internal.n_points - 1); i++){
				if( pct >= points[i][2] && pct <= points[i+1][2]){
					pta = i;
					ptb = i + 1;
					break;
				}
			}

			if(points[pta] && points[ptb]){
				pct_between = (pct - points[pta][2]) / (points[ptb][2] - points[pta][2]);
				lat_lng = [
					points[pta][1] + ((pct_between) * (points[ptb][1] - points[pta][1])),
					points[pta][0] + ((pct_between) * (points[ptb][0] - points[pta][0]))
				];
			} else {
				lat_lng = [
					points[pta][1],
					points[pta][0]
				];
			}

			return lat_lng;
		}

			
	};

	this.set_bounds = fn.set_bounds;
	this.map_position = fn.map_position;
	this.update_pixel_mapping = fn.update_pixel_mapping;

	fn.init();
};