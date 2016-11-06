'use strict';

angular.module('bahmni.clinical')
.controller('InvestigationsSelectorController', ['$scope', 'spinner', 'configurations', function ($scope, spinner, configurations) {
    var Selectable = Bahmni.Clinical.Selectable;
    var Category = Bahmni.Clinical.Category;
    $scope.selectablePanels = [];
    $scope.selectableTests = [];

    spinner.forPromise($scope.testsProvider.getTests()).then(function (tests) {
        initializeTests(tests);
        selectSelectablesBasedOnInvestigations();
        $scope.showAll();
    });

    var onSelectionChange = function (selectable) {
        if (selectable.isSelected()) {
            if (selectable.isSelectedFromSelf()) {
                addInvestigationForSelectable(selectable);
            }
        } else {
            removeInvestigationForSelectable(selectable);
        }
    };

    var initializeTests = function (tests) {
        var categories = $scope.categories = [];
        var selectablePanels = $scope.selectablePanels = [];
        var selectableTests = $scope.selectableTests = [];
        var filters = $scope.filters = [];
        angular.forEach(tests, function (test) {
            var selectableTest = new Selectable(test, [], onSelectionChange);
            selectableTests.push(selectableTest);
            var categoryData = test[$scope.categoryColumn] || {name: "Other"};
            var category = categories.filter(function (category) { return category.name === categoryData.name; })[0];

            if (category) {
                category.tests.push(selectableTest);
            } else {
                categories.push(new Category(categoryData.name, [selectableTest]));
            }

            angular.forEach(test.panels, function (testPanel) {
                var selectablePanel = selectablePanels.filter(function (panel) { return panel.name === testPanel.name; })[0];
                if (selectablePanel) {
                    selectablePanel.addChild(selectableTest);
                } else {
                    selectablePanel = new Selectable(testPanel, [selectableTest], onSelectionChange);
                    selectablePanels.push(selectablePanel);
                }
            });

            var filter = test[$scope.filterColumn];
            if (filters.indexOf(filter) === -1) {
                filters.push(filter);
            }
        });
    };

    var selectSelectablesBasedOnInvestigations = function () {
        var selectables = $scope.allSelectables();
        var currentInvestigations = $scope.investigations.filter(function (investigation) { return !investigation.voided; });
        angular.forEach(currentInvestigations, function (investigation) {
            var selectable = findSelectableForInvestigation(selectables, investigation);
            if (selectable) {
                selectable.select();
            }
        });
    };

    var findSelectableForInvestigation = function (selectables, investigation) {
        return selectables.filter(function (selectableConcept) { return selectableConcept.uuid === investigation.concept.uuid; })[0];
    };

    var createInvestigationFromSelectable = function (selectable) {
        return {
            concept: {uuid: selectable.uuid, name: selectable.name, set: selectable.set },
            orderTypeUuid: configurations.encounterConfig().orderTypes[selectable.orderTypeName],
            voided: false
        };
    };

    var addInvestigationForSelectable = function (selectable) {
        var investigation = findInvestigationForSelectable(selectable);
        if (investigation) {
            investigation.voided = false;
        } else {
            $scope.investigations.push(createInvestigationFromSelectable(selectable));
        }
    };

    var removeInvestigationForSelectable = function (selectable) {
        var investigation = findInvestigationForSelectable(selectable);
        if (investigation) {
            removeInvestigation(investigation);
        }
    };

    var removeInvestigation = function (investigation) {
        if (investigation.uuid) {
            investigation.voided = true;
        } else {
            var index = $scope.investigations.indexOf(investigation);
            $scope.investigations.splice(index, 1);
        }
    };

    var findInvestigationForSelectable = function (selectable) {
        return $scope.investigations.filter(function (investigation) { return investigation.concept.uuid === selectable.uuid; })[0];
    };

    $scope.showAll = function () {
        $scope.filterBy(null);
    };

    var applyCurrentFilterByFilterCoulmn = function (selectable) {
        return $scope.currentFilter ? selectable[$scope.filterColumn] === $scope.currentFilter : true;
    };

    $scope.filterBy = function (filter) {
        $scope.currentFilter = filter;
        $scope.filteredPanels = $scope.selectablePanels.filter(applyCurrentFilterByFilterCoulmn);
        angular.forEach($scope.categories, function (category) {
            category.filter(applyCurrentFilterByFilterCoulmn);
        });
    };

    $scope.hasFilter = function () {
        return !!$scope.currentFilter;
    };

    $scope.hasTests = function () {
        return $scope.selectableTests && $scope.selectableTests.length > 0;
    };

    $scope.isFilteredBy = function (filter) {
        return $scope.currentFilter === filter;
    };

    $scope.allSelectables = function () {
        return $scope.selectablePanels.concat($scope.selectableTests);
    };

    $scope.selctedSelectables = function () {
        return $scope.allSelectables().filter(function (selectable) { return selectable.isSelectedFromSelf(); });
    };
}])
.directive('investigationsSelector', function () {
    return {
        restrict: 'EA',
        templateUrl: 'consultation/views/investigationsSelector.html',
        controller: 'InvestigationsSelectorController',
        require: 'ngModel',
        scope: {
            investigations: '=ngModel',
            testsProvider: "=",
            filterColumn: "@",
            filterHeader: "@",
            categoryColumn: "@"
        }
    };
});
