var init = function(){
	templates = new Templates;
			
	$('body').append(templates.templates['layersPanel']).append(templates.templates['mapPanel']);
	regions = {
		map: $('#map'),
		layersPanel: $('.layers-panel'),
		toogle: $('.layers-panel').find('.visibility-toogle-btn')
	}

	layersPanelController = new LayersPanelController;

	myMap = new MyMap;

	onLayerAdded = myMap.addJsonLayer;
	onNewLayerAdded = myMap.addJsonLayer;
	bindRemoveBtn = function(layerName){
		$('span.remove-layer-btn').off('click');
		$('span.remove-layer-btn').on('click', function(e){
			console.log('hola k ase');
			layerName = $(this).attr('layername')
			layersPanelController.removeLayer(layerName);
		});
	}
	layersPanelController.on('layer:loaded', onLayerAdded);
	layersPanelController.on('layer:updated', onNewLayerAdded)
	myMap.on('layer:added', bindRemoveBtn);
	myMap.on('layer:removed', bindRemoveBtn);
	layersPanelController.on('layer:removed', myMap.removeLayer)
	

	regions.toogle.data({stat: 'visible'});

	regions.toogle.on('click', function(){
		btn = $(this)
		if (btn.data().stat === 'visible'){
			regions.layersPanel.animate({left: "-326px"},500)
			btn.css('background-image','url("./images/showLeftArrow.svg")')
			btn.data().stat = 'hide'
		} else {
			regions.layersPanel.animate({left: "0px"},500)
			btn.css('background-image','url("./images/hideLeftArrow.svg")')
			btn.data().stat = 'visible'
		}
	});
};
		