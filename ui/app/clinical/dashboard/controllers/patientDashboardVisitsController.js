'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams', 'spinner', '$q',
        function ($scope, $stateParams, spinner, $q) {
            var defer = $q.defer();
            var init = function () {
                return defer.promise;
            };
            var elementId = "#" + $scope.section.id;
            spinner.forPromise(init(), elementId);

            $scope.noOfVisits = $scope.visitHistory.visits.length;
            $scope.dialogData = {
                "noOfVisits": $scope.noOfVisits,
                "patient": $scope.patient,
                "sectionConfig": $scope.dashboard.getSectionByType("visits")
            };

            $scope.dashboardConfig = $scope.dashboard.getSectionByType("visits").dashboardConfig || {};
            $scope.patientUuid = $stateParams.patientUuid;
            defer.resolve();
        }]);