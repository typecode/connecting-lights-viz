function GoogleBalloonOverlay(message, map, visible) {
	this._message = message;
	this._latlng = message.lat_lng;
	this._visible = visible;
	this.div_ = null;
	this.setMap(map);
}

GoogleBalloonOverlay.prototype = new google.maps.OverlayView();

GoogleBalloonOverlay.prototype.onAdd = function() {
	var _me;
	_me = this;
	var div = document.createElement('div');
	div.style.background = 'url(static/img/dot_32.png) transparent';
	div.style.position = 'absolute';
	if(this._visible){
		div.style.display = 'block';
	} else {
		div.style.display = 'none';
	}
	div.style.width = "32px";
	div.style.height = "32px";
	div.style.webkitTransformOrigin = "32px 32px";
	this.div_ = div;
	this.$div_ = $(div);
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
};

GoogleBalloonOverlay.prototype.setPosition = function(lat_lng){
	this._latlng = lat_lng;
	this.draw();
};

GoogleBalloonOverlay.prototype.draw = function() {
	var projection, position;
	projection = this.getProjection();
	if(projection && this.div_){
		position = projection.fromLatLngToDivPixel(this._latlng);
		this.div_.style.left = position.x + 'px';
		this.div_.style.top = position.y + 'px';
	}
	
};

GoogleBalloonOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

GoogleBalloonOverlay.prototype.hide = function() {
	var me;
	me = this;
	if (this.$div_) {
		this.$div_.hide();
	}
};

GoogleBalloonOverlay.prototype.show = function() {
	if (this.$div_) {
		this.$div_.show();
	}
};

GoogleBalloonOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.div_.style.visibility == "hidden") {
			this.show();
		} else {
			this.hide();
		}
	}
};







function GoogleImageOverlay(bounds, image, map) {
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;
	this.div_ = null;
	this.setMap(map);
}

GoogleImageOverlay.prototype = new google.maps.OverlayView();

GoogleImageOverlay.prototype.onAdd = function() {
	var div,
		img,
		panes;
	
	div = document.createElement('div');
	div.style.position = "absolute";

	img = document.createElement("img");
	img.src = this.image_;
	img.style.width = "100%";
	img.style.height = "100%";

	div.appendChild(img);
	this.div_ = div;
	this.$div_ = $(div);
	
	panes = this.getPanes();
	panes.overlayLayer.appendChild(div);
};

GoogleImageOverlay.prototype.draw = function() {

	var overlayProjection,
		sw,
		ne,
		div;

	overlayProjection = this.getProjection();
	sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

	div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

GoogleImageOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

GoogleImageOverlay.prototype.hide = function(callback) {
	var me;
	me = this;
	if (this.$div_) {
		this.$div_.animate({
			'opacity': 0.0
		}, 500, function(){
			me.$div_.hide();
			if($.isFunction(callback)){
				callback();
			}
		});
	}
};

GoogleImageOverlay.prototype.show = function(callback) {
	if (this.$div_) {
		this.$div_.show().animate({
			'opacity': 1.0
		}, 500, function(){
			if($.isFunction(callback)){
				callback();
			}
		});
	}
};

GoogleImageOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.div_.style.visibility == "hidden") {
			this.show();
		} else {
			this.hide();
		}
	}
};

GoogleImageOverlay.prototype.toggleDOM = function() {
	if (this.getMap()) {
		this.setMap(null);
	} else {
		this.setMap(this.map_);
	}
};