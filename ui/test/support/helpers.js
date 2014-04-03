var Bahmni = Bahmni || {};
Bahmni.Tests = Bahmni.Tests || {};

Bahmni.Tests.openMRSConceptHelper = {
	getConceptByName: function(concepts, conceptName) {
        var foundConcept = concepts.filter(function(concept) {
            return concept.name.name === conceptName;
        })[0];
        if(foundConcept) return foundConcept;
        concepts.forEach(function(concept){
            if(!foundConcept) foundConcept = Bahmni.Tests.openMRSConceptHelper.getConceptByName(concept.setMembers, conceptName);
        });
        return foundConcept;
    },

    mapToConcept: function(openMRSConcept) {
        return {uuid: openMRSConcept.uuid, name: openMRSConcept.name.name};
    }
}