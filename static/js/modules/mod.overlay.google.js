function GoogleBalloonOverlay(message) {
	this._message = message;
	this._latlng = message.lat_lng;
	this.div_ = null;
}

GoogleBalloonOverlay.prototype = new google.maps.OverlayView();

GoogleBalloonOverlay.prototype.onAdd = function() {
	var _me;
	_me = this;
	var div = document.createElement('div');
	div.style.background = 'url(static/img/dot_32.png) transparent';
	div.style.position = 'absolute';
	div.style.display = 'block';
	div.style.width = "32px";
	div.style.height = "32px";
	div.style.webkitTransformOrigin = "32px 32px";
	this.div_ = div;
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
	if (this.div_) {
		this.div_.style.visibility = "hidden";
	}
};

GoogleBalloonOverlay.prototype.show = function() {
	if (this.div_) {
		this.div_.style.visibility = "visible";
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