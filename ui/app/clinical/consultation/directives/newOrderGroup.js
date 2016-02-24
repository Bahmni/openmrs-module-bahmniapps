'use strict';

angular.module('bahmni.clinical')
    .directive('newOrderGroup', [function () {
        var controller = function ($scope, $rootScope) {
            $scope.showOrderSet = true;
            $scope.edit = function (drugOrder, index) {
                $rootScope.$broadcast("event:editDrugOrder", drugOrder, index);
            };

            $scope.checkConflictingDrug = function(drugOrder) {
                $rootScope.$broadcast("event:includeOrderSetDrugOrder", drugOrder);
            }

        };
        return {
            templateUrl: 'consultation/views/newOrderGroup.html',
            scope: {
                treatments: "=",
                orderSetName: "="
            },
            controller: controller
        }
    }]);