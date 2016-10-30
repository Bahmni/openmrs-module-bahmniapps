'use strict';

Bahmni.Clinical.ConceptWeightBasedSorter = function (allTestAndPanelsConcept) {
    var sortedConcepts = allTestAndPanelsConcept ? allTestAndPanelsConcept.setMembers : [];
    var sortedNames = sortedConcepts.map(function (concept) { return concept.name.name; });

    this.sort = function (conceptHolders, nameToSort) {
        if (!conceptHolders) {
            return [];
        }
        conceptHolders.forEach(function (conceptHolder) {
            var index = sortedNames.indexOf(nameToSort ? nameToSort(conceptHolder) : conceptHolder.concept.name);
            conceptHolder.sortWeight = index === -1 ? 999 : index;
        });
        return _.sortBy(conceptHolders, 'sortWeight');
    };

    this.sortTestResults = function (labOrderResults) {
        if (!labOrderResults) {
            return [];
        }
        labOrderResults.forEach(function (labOrderResult) {
            var index = sortedNames.indexOf(labOrderResult.orderName || labOrderResult.testName);
            labOrderResult.sortWeight = index === -1 ? 999 : index;
            if (labOrderResult.isPanel) {
                labOrderResult.tests.forEach(function (test) {
                    var index = sortedNames.indexOf(test.testName);
                    test.sortWeight = index === -1 ? 999 : index;
                });
                labOrderResult.tests = _.sortBy(labOrderResult.tests, 'sortWeight');
            }
        });
        return _.sortBy(labOrderResults, 'sortWeight');
    };
};
