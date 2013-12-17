Bahmni.Opd.LabConceptsMapper = (function(){
    LabConceptsMapper = function() { };

    var forConcptClass = function(conceptClassName) {
        return function(concept) { return concept.conceptClass.name === conceptClassName };
    }

    var assignDepartmentToTests = function(tests, departmentConceptSet) {
        var departmentConcepts = departmentConceptSet ? departmentConceptSet.setMembers : [];
        angular.forEach(departmentConcepts, function(departmentConcept) {
            var department = { name: departmentConcept.name.name };
            angular.forEach(departmentConcept.setMembers, function(testConcept){
                var test = tests.filter(function(test){ return test.uuid === testConcept.uuid })[0];
                if(test) {
                    test.department = department;
                }
            });
        });
    }

    var mapPanelTests = function(sample, tests, panelConcept) {
        var panel = {uuid: panelConcept.uuid, name: panelConcept.name.name, sample: sample};
        var panelTestConcepts = panelConcept.setMembers.filter(forConcptClass('Test'));
        angular.forEach(panelTestConcepts, function(panelTestConcept){
            var test = tests.filter(function(test){ return test.uuid === concept.uuid })[0];
            if(test) {
                test.panels.push(panel);
            } else {
                tests.push({uuid: panelTestConcept.uuid, name: panelTestConcept.name.name, sample: sample, panels: [panel]});
            }
        });
    }

    LabConceptsMapper.prototype = {
        map: function(labConceptSet, departmentConceptSet) {
            if(!labConceptSet) return [];
            var tests = [];
            var sampleConcepts = labConceptSet.setMembers
            angular.forEach(sampleConcepts, function(sampleConcept) {
                var sample = {uuid : sampleConcept.uuid, name : sampleConcept.name.name }
                var panelConcepts = sampleConcept.setMembers.filter(forConcptClass('LabSet'));
                var testConcepts = sampleConcept.setMembers.filter(forConcptClass('Test'));
                angular.forEach(panelConcepts, function(panelConcept){
                    mapPanelTests(sample, tests, panelConcept);
                });
                angular.forEach(testConcepts, function(testConcept){
                    tests.push({uuid: testConcept.uuid, name: testConcept.name.name, sample: sample, panels: []});
                });
            });
            assignDepartmentToTests(tests, departmentConceptSet);
            return tests;
        }
    }

    return LabConceptsMapper;
})();

 
