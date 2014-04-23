'use strict';

Bahmni.Clinical.AllTestsPanelsConcept = function(allTestAndPanels) {
	this.sortOrders = function(orders) {
		if(!allTestAndPanels) return orders;
		allTestAndPanels.setMembers.forEach(function(concept, index){
			orders.forEach(function(order){ 
				if(order.concept.name === concept.name) order.sortWeight = index;
			});
		});
		return Bahmni.Common.Util.ArrayUtil.sort(orders, 'sortWeight');
	};
}
