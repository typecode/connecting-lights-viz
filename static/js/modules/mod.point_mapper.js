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
		points: POINT_MAPPER_POINTS
	};

	elements = {
		
	};

	fn = {
		init: function(){
			fn.prepare_point_mapper();
		},

		prepare_point_mapper: function(){
			var i, total_distance, distance_thus_far;
			internal.n_points = internal.points.length;
			total_distance = 0;
			for(i = 0; i < internal.n_points; i++){
				if(i > 0){
					total_distance += fn.distance(internal.points[i-1], internal.points[i]);
				}
			}
			distance_thus_far = 0;
			for(i = 0; i < internal.n_points; i++){
				if(i > 0){
					distance_thus_far += fn.distance(internal.points[i-1], internal.points[i]);
				}
				internal.points[i].push(distance_thus_far/total_distance);
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

		map_position: function(pct){
			var i, lat_lng, points, pta, ptb;

			points = internal.points;

			for(i = 0; i < (internal.n_points - 1); i++){
				if( pct >= internal.points[i][2] && pct <= internal.points[i+1][2]){
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
		}
	};

	this.map_position = fn.map_position;

	fn.init();
};