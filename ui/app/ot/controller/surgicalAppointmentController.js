'use strict';

angular.module('bahmni.ot')
    .controller('surgicalAppointmentController', ['$scope', '$q', 'spinner', 'surgicalAppointmentService', 'locationService',
        function ($scope, $q, spinner, surgicalAppointmentService, locationService) {
            var init = function () {
                $scope.surgicalForm = {};
                return $q.all([surgicalAppointmentService.getSurgeons(), locationService.getAllByTag("Operation Theater")]).then(function (response) {
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
