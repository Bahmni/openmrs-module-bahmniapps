'use strict';

angular.module('bahmni.common.displaycontrol.hint')
    .directive('hint', [
        function () {
            var link = function ($scope) {
                $scope.hintForNumericConcept = Bahmni.Common.Domain.Helper.getHintForNumericConcept($scope.conceptDetails);
            };

            return {
                restrict: 'E',
                link: link,
                template: '<small class="hint" ng-if="::hintForNumericConcept">{{::hintForNumericConcept}}</small>',
                scope: {
                    conceptDetails: "="
                }
            };
        }]);
