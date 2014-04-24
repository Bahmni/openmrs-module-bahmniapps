'use strict';

Bahmni.Clinical.AllTestsPanelsConcept = function(allTestAndPanels) {
	var sortedConcepts = allTestAndPanels ? allTestAndPanels.setMembers : [];

	this.sort = function(conceptHolders) {
		sortedConcepts.forEach(function(concept, index){
			conceptHolders.forEach(function(conceptHolder){ 
				if(conceptHolder.concept.name === concept.name) conceptHolder.sortWeight = index;
			});
		});
		return Bahmni.Common.Util.ArrayUtil.sort(conceptHolders, 'sortWeight');
	};
}
