var MyMap = (function(config){
	self = this;
	this.triggerController = new TriggerController();
	
	var mapConfig = {
		maxZoom: 18,
		minZoom: 3,
		//crs: L.CRS.EPSG3857,
		center: [40.46, -2.50],
		zoom: 6
	};
	
	var layersIndex = [];
	
	this.layers = {
		overlayMaps: {},
		baseMaps: {}
	}
	
	var getColorConstructor = function(array, property){
		if (Object.keys(array[0])[0].indexOf('<') >= 0 || Object.keys(array[0])[0].indexOf('>') >= 0 || Object.keys(array[0])[0].indexOf('=') >= 0) {
			return function(){
				var self = this;
				this.array = array;
				this.property = property;
				this.getColor = function(d){
					for (var i=0, f; f = self.array[i]; i++){
						key = Object.keys(f)[0];
						if (key.indexOf('<=') >= 0) {
							val = key.split('<=')[0]
							if (d.properties[self.property] <= val){ return f[key] };
						} else if (key.indexOf('<') >= 0) {
							val = key.split('<')[0]
							if (d.properties[self.property] < val){ return f[key] };
						} else if (key.indexOf('>=') >= 0) {
							val = key.split('>=')[0]
							if (d.properties[self.property] >= val){ return f[key] };
						} else if (key.indexOf('>') >= 0) {
							val = key.split('>')[0]
							if (d.properties[self.property] > val){ return f[key] };
						} else if (key.indexOf('=') >= 0) {
							val = key.split('=')[0]
							if (d.properties[self.property] == val){ return f[key] };
						}
					}
				}
			}
		} else if (Number(Object.keys(array[0])[0])){
			return function(){
				var self = this;
				this.array = _.sortBy(array, function(val){return Number(Object.keys(val)[0])});
				this.property = property;
				this.getColor = function(d){
					for (var i=0, f; f = self.array[i]; i++){
						key = Object.keys(f)[0];
						if (i == self.array.length - 1){
							if (d.properties[self.property] >= Number(key)){
								return f[key];
							}
						} else {
							nextKey = Object.keys(self.array[i+1])[0];
							if (d.properties[self.property] >= Number(key) && d.properties[self.property] < Number(nextKey)){
								return f[key];
							}
						}
					}
				}
			}
		} else {
			return function(){
				var self = this;
				this.array = array;
				this.property = property;
				this.getColor = function(d){
					for (var i=0, f; f = self.array[i]; i++){
						key = Object.keys(f)[0];
						if (d[self.property] == key) {
							return f[key];
						}
					}
				}
			}
		}
			
	}
	
	var setupTiles = function(){
		self.tileConfig = {maxZoom: mapConfig.maxZoom, minZoom: mapConfig.minZoom}
		
		self.tileConfig.attribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
		tileLayer1 = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', self.tileConfig);
		self.map.addLayer(tileLayer1);
		self.layers.baseMaps['Toner'] = tileLayer1
		
		self.tileConfig.attribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
		tileLayer2 = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', self.tileConfig);
		self.map.addLayer(tileLayer2);
		self.layers.baseMaps['TonerLite'] = tileLayer2
		
		self.tileConfig.attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		tileLayer3 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', self.tileConfig);
		self.map.addLayer(tileLayer3);
		self.layers.baseMaps['OpenStreetMap'] = tileLayer3;
		
		setupControls();
	}
	
	var setupMap = function(){
		mapConfig = _.extend(mapConfig, config)
		
		self.map = L.map('map', mapConfig)
		
		$('.leaflet-control-container').find('.leaflet-left').removeClass('leaflet-left').addClass('leaflet-right');
		setupTiles();
	};
	
	var setupControls = function(){
		self.layerControls = L.control.layers(self.layers.baseMaps, self.layers.overlayMaps).addTo(self.map);
		$(self.layerControls._container).parent().removeClass('leaflet-top').addClass('leaflet-bottom');
	}
	
	var refreshControls = function(){
		$(self.layerControls._container).remove()
		setupControls();
	}
	
	var getConfig = function(style, type){
		var config = {};
		var pointToLayer = null;
		var styleMethod = null;
		
		if (style.fillColor instanceof Array){
			myColorGetter = getColorConstructor(style.fillColor, style.property);
			myColorGetter = new myColorGetter
			style.fillColor = myColorGetter.getColor
			styleMethod = function(feature){
				var staticStyle = _.clone(style);
				var staticFillColor = style.fillColor(feature);
				staticStyle.fillColor = staticFillColor;
				return staticStyle;
			}
		}
		
		if (type[0] == 'Point' && type[1] == true){
			pointToLayer = function(feature, latlng){
				return L.circleMarker(latlng, style)
			}
		}
		
		if (style.color instanceof Array){
			myColorGetter = getColorConstructor(style.color, style.property);
			myColorGetter = new myColorGetter
			style.color = myColorGetter.getColor
			styleMethod = function(feature){
				var staticStyle = _.clone(style);
				var staticColor = style.color(feature);
				staticStyle.color = staticColor;
				return staticStyle;
			}
		}
		
		if (type[0] == 'Point' && type[1] == true){
			pointToLayer = function(feature, latlng){
				return L.circleMarker(latlng, style)
			}
		}
		
		if (styleMethod){
			config.style = styleMethod;
		} else if (style) {
			config.style = style;
		}
		
		if (pointToLayer) {
				config.pointToLayer = pointToLayer;
		}
		
		return config;
	}
	
	this.addJsonLayer = function(data){
		var style = data.style,
			type = data.type,
			config = {}
			
		if (data && style) {
			config = getConfig(style, type);
		}
		
		layer = L.geoJSON(data.data, config)
		layer.layerName = data.name;
		layersIndex.push(layer)
		layer.addTo(self.map);
		self.map.fitBounds(layer.getBounds());
		self.layers.overlayMaps[data.name] = layer;
		refreshControls();
		self.triggerController.trigger('layer:added', data.name)
	}
	
	this.removeLayer = function(layerName){
		debugger
		layer = _.findWhere(layersIndex, {layerName: layerName})
		layersIndex.splice(layersIndex.indexOf(layer), 1);
		self.map.removeLayer(layer);
		self.triggerController.trigger('layer:removed',layerName);
	}
	
	setupMap();
	
	return {
		on: this.triggerController.on,
		off: this.triggerController.off,
		trigger: this.triggerController.trigger,
		addJsonLayer: this.addJsonLayer,
		removeLayer: this.removeLayer
	}
});