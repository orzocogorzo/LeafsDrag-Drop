var Templates = (function(){
	var self = this
	
	this.templates = {
		layersPanel: '<div class="layers-panel"><div class="wrapperDND"><div class="DnDPackagin"><div id="drop_zone">Drop files here</div></div><output id="listDND"><ul id="layersList" class="layers-list"></ul></output></div><div class="visibility-column"><div class="visibility-toogle-btn"></div></div></div>',
		mapPanel: '<div id="map"></div>'
	}
	
	this.addTemplate = function(key, html){
		self.templates[key] = html
	}
	
	this.removeTemplate = function(key){
		delete self.templates[key];
	}
})
	