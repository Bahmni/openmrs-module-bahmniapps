Bahmni.Opd.LabConceptsMapper = function() {
	
};

Bahmni.Opd.LabConceptsMapper.prototype = {
	map: function(labConceptSet, departmentConceptSet) {
		var samples = [];
        var panels = [];
        var tests = [];
        angular.forEach(labConceptSet.setMembers, function(concept) {
            var sample = {uuid : concept.uuid, name : concept.name.name }
            samples.push(sample);

            angular.forEach(concept.setMembers, function(childConcept){
                if(childConcept.conceptClass.name == 'LabSet') {
                    var panel = {uuid: childConcept.uuid, name: childConcept.name.name, sample: sample};
                    panels.push(panel);
                    angular.forEach(childConcept.setMembers, function(panelChildConcept){
                        if(panelChildConcept.conceptClass.name == 'Test') {
                            var test = tests.filter(function(test){ return test.uuid === concept.uuid })[0];
                            if(test) {
                                test.panels.push(panel);
                            } else {
                                tests.push({uuid: panelChildConcept.uuid, name: panelChildConcept.name.name, sample: sample, panels: [panel]});
                            }
                        }                                                            
                    });
                }
                else if(childConcept.conceptClass.name == 'Test') {
                    tests.push({uuid: childConcept.uuid, name: childConcept.name.name, sample: sample, panels: []});
                }
            });
        });

		angular.forEach(departmentConceptSet.setMembers, function(departmentConcept) {
			var department = { name: departmentConcept.name.name };
			angular.forEach(departmentConcept.setMembers, function(testConcept){
		    	var test = tests.filter(function(test){ return test.uuid === testConcept.uuid })[0];
		    	if(test) {
		    		test.department = department;
		    	}
			});
		});
		return {samples: samples, panels: panels, tests: tests};
	}
}