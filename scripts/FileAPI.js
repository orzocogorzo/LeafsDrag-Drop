var LayersPanelController = (function(){
	
	var self = this
	this.triggerController = new TriggerController()
	
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		//Great succes! All the File APIs are suppoerted.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

	/* Select Files Input Handler
	function handleFileSelect(evt){
		var files = evt.target.files;
		var outputTemplate = [];
		
		for (var i = 0, f; f = files[i]; i++){
			console.log(f.type);
			outputTemplate.push(
				'<li><strong>', 
				escape(f.name), 
				'</strong> (', 
				f.type || 'n/a', 
				f.size, 
				'bytes, last modified: ', 
				f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', 
				'</li>'
			);
		}
		
		document.getElementById('list').innerHTML = '<ul>' + outputTemplate.join('') + '</ul>';
	}*/
	
	var outputTemplate = _.template(
		'<%_.forEach(layersArray, function(l,i){%>' 
			+ '<li class="layer-list-item">'
				+ '<p class="layer-name"><u><%=l.name%></u></p>'
				+ '<p class="layer-type">type:' 
					+ '<%if (l.type) {%><%=l.type%><%}%>'
					+ '<%if (!l.type) {%> text/json <%}%>'
				+ '</p>'
				+ '<p class="layer-date">last modified: '
					+ '<%if (l.lastModifiedDate) {%> <%= l.lastModifiedDate %> <%} %>'
				+ '</p>'
				+ '<span class="remove-layer-btn" layername="<%=l.name.split(".")[0]%>">X</span>'
			+ '</li>' 
		+ '<%})%>'
	);
	
	var layersArray = []
	
	//Drag and Drop Files Input Handler
	function handleDropFileSelect(evt){
		evt.stopPropagation();
		evt.preventDefault();
		
		var files = evt.dataTransfer.files;
			
		for (var i = 0, f; f=files[i]; i++){
			if (!f.type.match('text/plain') && (f.name.split('.')[1] !== 'json' && f.name.split('.')[1] !== 'geojson' )) {
				continue
			}
			
			var reader = new FileReader();
			
			/*reader.onload = (
				function(theFile){
					return function(e){
						data = e.target.result
						self.layersDataArray.push(data)
					}
				}
			)(f);*/
			
			reader.onloadend = (function(theFile){
				return function(e){
					data = {};
					data.data = JSON.parse(e.target.result);
					data.name = theFile.name.split('.')[0];
					data.type = data.data.type;
					data.style = data.data.style;
					if (layersArray.length == 0){
						self.triggerController.trigger('layer:loaded', data);
					} else {
						self.triggerController.trigger('layer:updated', data);
					}
				}
			})(f);
			
			reader.readAsText(f);
			
			layer = {
				name: f.name.split('.')[0],
				type: f.type
			}
			
			if (f.lastModifiedDate) {
				layer.lastModifiedDate = f.lastModifiedDate.toLocaleDateString();
			} else {
				layer.lastModifiedDate = 'n/a';
			}
				
			if (layersArray.indexOf(layer.name) < 0){layersArray.push(layer);}
		}
		
		document.getElementById('layersList').innerHTML = outputTemplate({layersArray: layersArray})
	}
	
	function handleDragOver(evt){
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffects = 'copy';
	}
	
	this.removeLayer = function(layerName){
		layerToRemove = _.findWhere(layersArray, {name: layerName});
		if (layerToRemove !== undefined){
			layersArray.splice(layersArray.indexOf(layerToRemove), 1);
			document.getElementById('layersList').innerHTML = outputTemplate({layersArray: layersArray});
			self.triggerController.trigger('layer:removed', layerName)
			layerToRemove = undefined
			layerName = undefined
		}
	}
	var  dropzone = document.getElementById('drop_zone');
	dropzone.addEventListener('dragover', handleDragOver, false);
	dropzone.addEventListener('drop', handleDropFileSelect, false);

	//document.getElementById('files').addEventListener('change', handleFileSelect, false);
	
	return {
		removeLayer: this.removeLayer,
		on: this.triggerController.on,
		off: this.triggerController.off,
		trigger: this.triggerController.trigger
	}	
});