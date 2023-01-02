'use strict';

angular.module('bahmni.clinical')
    .directive('consultationConfirmOnExit', function () {
        return {
            link: function ($scope, elem, attrs) {
                $scope.$on('$stateChangeStart', function (event, next, current) {
                    var noOfOrders = $scope.consultation.orders.length;
                    var noOfMedications = 0;
                    if ($scope.consultation.newlyAddedTabTreatments && $scope.tabConfigName) {
                        noOfMedications = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments.length;
                    }

                    if (noOfOrders > 0 || noOfMedications > 0 || ($scope[attrs.name] && $scope[attrs.name].$dirty)) {
                        $scope.$parent.$parent.$broadcast("event:changes-not-saved");
                    }
                });
            }
        };
    });
