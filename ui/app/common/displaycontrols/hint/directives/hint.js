'use strict';

angular.module('bahmni.common.displaycontrol.hint')
    .directive('hint', ['conceptSetService','spinner',
        function (conceptSetService,spinner) {
            var link = function($scope){
                $scope.hintForNumericConcept = Bahmni.Common.Domain.Helper.getHintForNumericConcept($scope.conceptDetails);
            };

            return {
                restrict: 'E',
                link:link,
                template: '<small class="hint">{{hintForNumericConcept}}</small>',
                scope: {
                    conceptDetails: "="
                }
            };
        }]);