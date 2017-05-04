'use strict';

angular.module('bahmni.ot')
    .controller('surgicalAppointmentController', ['$scope', '$q', 'spinner', 'surgicalAppointmentService', 'locationService', 'appService',
        function ($scope, $q, spinner, surgicalAppointmentService, locationService, appService) {
            var init = function () {
                $scope.surgicalForm = {};
                var surgeonsConcept = appService.getAppDescriptor().getConfigValue("primarySurgeonsForOT");
                return $q.all([surgicalAppointmentService.getSurgeons(surgeonsConcept), locationService.getAllByTag("Operation Theater")]).then(function (response) {
                    $scope.surgeons = response[0].data.results[0].answers;
                    $scope.locations = response[1].data.results;
                    return response;
                });
            };

            $scope.isFormValid = function () {
                return $scope.createSurgicalBlockForm.$valid && $scope.isStartDatetimeBeforeEndDatetime($scope.surgicalForm.startDatetime, $scope.surgicalForm.endDatetime);
            };

            $scope.isStartDatetimeBeforeEndDatetime = function (startDate, endDate) {
                if (startDate && endDate) {
                    return startDate < endDate;
                }
                return true;
            };

            spinner.forPromise(init());
        }]);
