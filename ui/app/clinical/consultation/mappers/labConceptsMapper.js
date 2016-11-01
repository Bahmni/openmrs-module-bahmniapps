'use strict';

Bahmni.LabConceptsMapper = (function () {
    var LabConceptsMapper = function () { };

    var forConcptClass = function (conceptClassName) {
        return function (concept) { return concept.conceptClass.name === conceptClassName; };
    };

    var assignDepartmentToTests = function (tests, departmentConceptSet) {
        var departmentConcepts = departmentConceptSet ? departmentConceptSet.setMembers : [];
        angular.forEach(departmentConcepts, function (departmentConcept) {
            var department = { name: departmentConcept.name.name };
            angular.forEach(departmentConcept.setMembers, function (testConcept) {
                var test = tests.filter(function (test) { return test.uuid === testConcept.uuid; })[0];
                if (test) {
                    test.department = department;
                }
            });
        });
    };

    var createTest = function (concept, sample, panels) {
        return {
            uuid: concept.uuid,
            name: concept.name.name,
            sample: sample,
            panels: panels,
            set: false,
            orderTypeName: Bahmni.Clinical.Constants.labOrderType
        };
    };

    var createPanel = function (concept, sample) {
        return {
            uuid: concept.uuid,
            name: concept.name.name,
            sample: sample,
            set: true,
            orderTypeName: Bahmni.Clinical.Constants.labOrderType
        };
    };

    var mapPanelTests = function (sample, tests, panelConcept) {
        var panel = createPanel(panelConcept, sample);
        var testConcepts = panelConcept.setMembers.filter(forConcptClass(Bahmni.Clinical.Constants.testConceptName));
        angular.forEach(testConcepts, function (testConcept) {
            var test = tests.filter(function (test) { return test.uuid === testConcept.uuid; })[0];
            if (test) {
                test.panels.push(panel);
            } else {
                tests.push(createTest(testConcept, sample, [panel]));
            }
        });
    };

    LabConceptsMapper.prototype = {
        map: function (labConceptSet, departmentConceptSet) {
            if (!labConceptSet) {
                return [];
            }
            var tests = [];
            var sampleConcepts = labConceptSet.setMembers;
            angular.forEach(sampleConcepts, function (sampleConcept) {
                var sample = {uuid: sampleConcept.uuid, name: sampleConcept.name.name };
                var panelConcepts = sampleConcept.setMembers.filter(forConcptClass(Bahmni.Clinical.Constants.labSetConceptName));
                var testConcepts = sampleConcept.setMembers.filter(forConcptClass(Bahmni.Clinical.Constants.testConceptName));
                angular.forEach(panelConcepts, function (panelConcept) {
                    mapPanelTests(sample, tests, panelConcept);
                });
                angular.forEach(testConcepts, function (testConcept) {
                    var test = tests.filter(function (test) { return test.uuid === testConcept.uuid; })[0];
                    if (!test) {
                        tests.push(createTest(testConcept, sample, []));
                    }
                });
            });
            assignDepartmentToTests(tests, departmentConceptSet);
            return tests;
        }
    };

    return LabConceptsMapper;
})();

