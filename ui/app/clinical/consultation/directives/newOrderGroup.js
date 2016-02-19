'use strict';

angular.module('bahmni.clinical')
    .directive('newOrderGroup', [function () {
        var controller = function ($scope, $rootScope) {
            $scope.edit = function (index) {
                $rootScope.$broadcast("event:editDrugOrder", index);
            };

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