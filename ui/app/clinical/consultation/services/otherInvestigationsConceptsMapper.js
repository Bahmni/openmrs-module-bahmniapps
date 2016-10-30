'use strict';

Bahmni.OtherInvestigationsConceptsMapper = (function () {
    var OtherInvestigationsConceptsMapper = function (orderTypesMap) {
        this.orderTypesMap = orderTypesMap;
    };

    var assignCategoriesToTests = function (tests, categoryConceptSet) {
        var categoryConcepts = categoryConceptSet ? categoryConceptSet.setMembers : [];
        angular.forEach(categoryConcepts, function (categoryConcept) {
            var category = { name: categoryConcept.name.name };
            angular.forEach(categoryConcept.setMembers, function (testConcept) {
                var test = tests.filter(function (test) { return test.uuid === testConcept.uuid; })[0];
                if (test) {
                    test.category = category;
                }
            });
        });
    };

    var createTest = function (concept, investigationType, orderTypesMap) {
        var orderTypeName = orderTypesMap[investigationType.name] || investigationType.name;
        return {
            uuid: concept.uuid,
            name: concept.name.name,
            type: investigationType,
            orderTypeName: orderTypeName
        };
    };

    OtherInvestigationsConceptsMapper.prototype = {
        map: function (otherInvestigationsConcept, categoryConceptSet) {
            var self = this;
            if (!otherInvestigationsConcept) {
                return [];
            }
            var tests = [];
            var testTypeSets = otherInvestigationsConcept.setMembers.filter(function (concept) { return concept.set; });
            angular.forEach(testTypeSets, function (concept) {
                var type = {uuid: concept.uuid, name: concept.name.name };
                var testConcepts = concept.setMembers.filter(function (concept) { return concept.conceptClass.name === Bahmni.Clinical.Constants.testConceptName; });
                angular.forEach(testConcepts, function (testConcept) {
                    tests.push(createTest(testConcept, type, self.orderTypesMap));
                });
            });
            assignCategoriesToTests(tests, categoryConceptSet);
            return tests;
        }
    };

    return OtherInvestigationsConceptsMapper;
})();

