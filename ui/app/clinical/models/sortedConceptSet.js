'use strict';

Bahmni.Clinical.SortedConceptSet = function(allTestAndPanelsConcept) {
	var sortedConcepts = allTestAndPanelsConcept ? allTestAndPanelsConcept.setMembers : [];
    var sortedNames = sortedConcepts.map(function(concept) {return concept.name.name;});

	this.sort = function(conceptHolders) {
        if(!conceptHolders) return [];
        conceptHolders.forEach(function(conceptHolder){
            var index = sortedNames.indexOf(conceptHolder.concept.name);
            conceptHolder.sortWeight = index === -1 ? 999 : index;
		});
		return _.sortBy(conceptHolders, 'sortWeight');
	};

    this.sortTestResults = function(labOrderResults) {
        if(!labOrderResults) return [];
        labOrderResults.forEach(function(labOrderResult){
            var index = sortedNames.indexOf(labOrderResult.testName);
            labOrderResult.sortWeight = index === -1 ? 999 : index;
        });
        return _.sortBy(labOrderResults, 'sortWeight');
    };
};
