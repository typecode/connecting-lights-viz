// var ImageOverlayGoogle = L.Class.extend({

// 	initialize: function (message) {
// 		// save position of the layer or any options from the constructor
// 		this._message = message;
// 		this._latlng = message.lat_lng;
// 	},

// 	onAdd: function (map) {
// 		this._map = map;
// 		this._el = L.DomUtil.create('div', 'leaflet-zoom-hide');
// 		this._el.style.background = 'url(static/img/dot_32.png) transparent';
// 		//this._el.style.backgroundSize = '32px 32px';
// 		this._el.style.position = 'absolute';
// 		this._el.style.display = 'block';
// 		this._el.style.width = "32px";
// 		this._el.style.height = "32px";
// 		this._el.style.webkitTransformOrigin = "32px 32px";
// 		map.getPanes().overlayPane.appendChild(this._el);
// 		map.on('viewreset', this._reset, this);
// 		this._reset();
// 	},

// 	update: function(){
// 		var pos = this._map.latLngToLayerPoint(this._latlng);
// 		L.DomUtil.setPosition(this._el, pos);
// 	},

// 	onRemove: function (map) {
// 		// remove layer's DOM elements and listeners
// 		map.getPanes().overlayPane.removeChild(this._el);
// 		map.off('viewreset', this._reset, this);
// 	},

// 	_reset: function () {
// 		var pos = this._map.latLngToLayerPoint(this._latlng);
// 		L.DomUtil.setPosition(this._el, pos);
// 	}
// });
