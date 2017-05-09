'use strict';

angular.module('bahmni.ot')
    .controller('surgicalAppointmentController', ['$scope', '$q', '$state', 'spinner', 'surgicalAppointmentService', 'locationService', 'appService', 'messagingService', 'surgicalAppointmentHelper',
        function ($scope, $q, $state, spinner, surgicalAppointmentService, locationService, appService, messagingService, surgicalAppointmentHelper) {
            var init = function () {
                $scope.surgicalForm = {};
                var providerUuids = appService.getAppDescriptor().getConfigValue("primarySurgeonsForOT");
                return $q.all([surgicalAppointmentService.getSurgeons(), locationService.getAllByTag("Operation Theater")]).then(function (response) {
                    $scope.surgeons = surgicalAppointmentHelper.filterProvidersByUuid(providerUuids, response[0].data.results);
                    $scope.locations = response[1].data.results;
                    return response;
                });
            };

            var mapSurgicalFormToSurgicalBlock = function (surgicalForm) {
                var surgicalForm = {
                    location: surgicalForm.location,
                    startDatetime: surgicalForm.startDatetime,
                    endDatetime: surgicalForm.endDatetime,
                    provider: { uuid: surgicalForm.provider.uuid }
                };
                return surgicalForm;
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

            $scope.save = function (surgicalForm) {
                if (!$scope.isFormValid()) {
                    messagingService.showMessage('error', "{{'OT_ENTER_MANDATORY_FIELDS' | translate}}");
                    return;
                }
                var surgicalBlock = mapSurgicalFormToSurgicalBlock(surgicalForm);
                spinner.forPromise(surgicalAppointmentService.saveSurgicalBlock(surgicalBlock)).then(function (response) {
                    surgicalForm = response.data;
                    messagingService.showMessage('info', "{{'OT_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                }).catch(function (error) {
                });
            };

            $scope.goToHome = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();

                $state.go("home", options);
            };

            spinner.forPromise(init());
        }]);
