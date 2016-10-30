'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllVisitsController', ['$scope', '$state', '$stateParams',
        function ($scope, $state, $stateParams) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.noOfVisits = $scope.ngDialogData.noOfVisits;
            var sectionConfig = $scope.ngDialogData.sectionConfig;

            var defaultParams = {
                maximumNoOfVisits: $scope.noOfVisits ? $scope.noOfVisits : 0
            };

            $scope.params = angular.extend(defaultParams, $scope.params);
            $scope.params = angular.extend(sectionConfig, $scope.params);
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.showAllObservationsData = true;
        }]);
