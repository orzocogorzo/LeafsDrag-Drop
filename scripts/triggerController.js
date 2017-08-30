var TriggerController = (function(){
	var triggerBindEvents = {
		'layer:loaded': null
	}

	this.trigger = function(ev, data){
		Object.keys(triggerBindEvents).map(function(key, index) {
			if (ev === key){
				triggerBindEvents[key](data)
			}
		});
	}

	this.on = function(ev, callback){
		triggerBindEvents[ev] = callback;
	}

	this.off = function(ev) {
		delete triggerBindEvents[ev];
	}
})