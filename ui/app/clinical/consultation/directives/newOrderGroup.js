'use strict';

angular.module('bahmni.clinical')
    .directive('newOrderGroup', [function () {
        var controller = function ($scope) {
            $scope.config = {
                columns: ['drugName', 'dosage', 'frequency', 'route', 'duration', 'startDate', 'instructions'],
                actions: ['edit'],
                columnHeaders: {
                    frequency: 'MEDICATION_LABEL_FREQUENCY',
                    drugName: 'MEDICATION_DRUG_NAME_TITLE'
                }
            };
            var setOrderSetName = function (orderSetNewName) {
                if (!_.isUndefined(orderSetNewName)) {
                    $scope.config.title = orderSetNewName;
                }
            };
            $scope.$watch('orderSetName', setOrderSetName);
        };
        return {
            templateUrl: 'consultation/views/newOrderGroup.html',
            scope: {
                treatments: "=",
                orderSetName: "="
            },
            controller: controller
        };
    }]);
