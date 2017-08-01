'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentServicesController', ['$scope', '$state', '$location', 'spinner',
        'appointmentsServiceService', 'appService', 'ngDialog',
        function ($scope, $state, $location, spinner, appointmentsServiceService, appService, ngDialog) {
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.createService = function () {
                $state.go('home.admin.service.edit', {uuid: 'new'});
            };

            $scope.editService = function (uuid) {
                $state.go('home.admin.service.edit', {uuid: uuid});
            };

            $scope.deleteAppointmentService = function (service) {
                ngDialog.open({
                    template: 'views/admin/deleteAppointmentService.html',
                    className: 'ngdialog-theme-default',
                    data: {service: service},
                    controller: 'deleteAppointmentServiceController'
                });
            };

            var init = function () {
                return appointmentsServiceService.getAllServices().then(function (response) {
                    $scope.appointmentServices = response.data;
                });
            };

            return spinner.forPromise(init());
        }]);
