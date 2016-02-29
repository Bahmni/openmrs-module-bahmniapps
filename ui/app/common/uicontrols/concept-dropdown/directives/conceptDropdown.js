(function () {
    'use strict';

    var constructSearchResult = function (concept) {
        var conceptName = concept.name.name || concept.name;
        return {
            label: conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        }
    };

    var find = function (allAnswers, savedAnswer) {
        return _.find(allAnswers, function (answer) {
            return savedAnswer && (savedAnswer.uuid === answer.concept.uuid);
        });
    };

    var toBeInjected = ['conceptService'];
    var conceptDropdown = function (conceptService) {
        var controller = function ($scope) {
            $scope.onChange = $scope.onChange();

            var response = function (answers) {
                $scope.answers = answers;
                $scope.model = find(answers, $scope.model);
            };
            if (!$scope.codedConceptName && $scope.defaultConcept) {
                conceptService.getAnswers($scope.defaultConcept).then(function (results) {
                    return _.map(results, constructSearchResult);
                }).then(response);
                return;
            }

            conceptService.getConceptByQuestion({
                codedConceptName: $scope.codedConceptName
            }).then(function (results) {
                return _.map(results, constructSearchResult);
            }).then(response);
        };

        return {
            controller: controller,
            restrict: 'E',
            scope: {
                model: '=',
                codedConceptName: '=?',
                defaultConcept: '=',
                onChange: '&'
            },
            templateUrl: '../common/uicontrols/concept-dropdown/views/conceptDropdown.html'
        }
    };

    conceptDropdown.$inject = toBeInjected;
    angular.module('bahmni.common.conceptSet').directive('conceptDropdown', conceptDropdown);
})();