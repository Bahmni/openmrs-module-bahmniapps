Bahmni.Opd.OtherInvestigationsConceptsMapper = (function(){
	var OtherInvestigationsConceptsMapper = function() {};

	var assignCategoriesToTests = function(tests, categoryConceptSet){
	    var categoryConcepts = categoryConceptSet ? categoryConceptSet.setMembers : [];
		angular.forEach(categoryConcepts, function(categoryConcept) {
			var category = { name: categoryConcept.name.name };
			angular.forEach(categoryConcept.setMembers, function(testConcept){
		    	var test = tests.filter(function(test){ return test.uuid === testConcept.uuid })[0];
		    	if(test) {
		    		test.category = category;
		    	}
			});
		});
	}
	
	OtherInvestigationsConceptsMapper.prototype = {
		map: function(otherInvestigationsConcept, categoryConceptSet) {
	        if(!otherInvestigationsConcept) return [];
	        var tests = [];
	        var testTypeSets = otherInvestigationsConcept.setMembers.filter(function(concept) { return concept.set; });
	        angular.forEach(testTypeSets, function(concept) {
	            var type = {uuid : concept.uuid, name : concept.name.name }
	            var testConcepts = concept.setMembers.filter(function(concept) { return concept.conceptClass.name === 'Test'});
	            angular.forEach(testConcepts, function(testConcept){
	                tests.push({uuid: testConcept.uuid, name: testConcept.name.name, type: type});
	            });
	        });
	        assignCategoriesToTests(tests, categoryConceptSet);
			return tests;
		}
	}

	return OtherInvestigationsConceptsMapper;
})();

