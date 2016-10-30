(function () {
    'use strict';

    var constructSearchResult = function (concept) {
        var conceptName = concept.shortName || concept.name.name || concept.name;
        return {
            label: conceptName,
            value: conceptName,
            concept: concept,
            uuid: concept.uuid,
            name: conceptName
        };
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
                $scope.selectedAnswer = find(answers, $scope.selectedAnswer);
            };
            if (!$scope.answersConceptName && $scope.defaultConcept) {
                conceptService.getAnswers($scope.defaultConcept).then(function (results) {
                    return _.map(results, constructSearchResult);
                }).then(response);
                return;
            }

            conceptService.getAnswersForConceptName({
                answersConceptName: $scope.answersConceptName
            }).then(function (results) {
                return _.map(results, constructSearchResult);
            }).then(response);
        };

        return {
            controller: controller,
            restrict: 'E',
            scope: {
                selectedAnswer: '=model',
                answersConceptName: '=?',
                defaultConcept: '=',
                onChange: '&',
                onInvalidClass: '@',
                isValid: '=',
                ngDisabled: '='
            },
            templateUrl: '../common/uicontrols/concept-dropdown/views/conceptDropdown.html'
        };
    };

    conceptDropdown.$inject = toBeInjected;
    angular.module('bahmni.common.uicontrols').directive('conceptDropdown', conceptDropdown);
})();
