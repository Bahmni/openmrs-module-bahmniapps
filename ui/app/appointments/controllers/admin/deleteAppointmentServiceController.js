'use strict';

angular.module('bahmni.appointments')
    .controller('deleteAppointmentServiceController', ['$scope', 'appointmentsServiceService', 'messagingService', 'ngDialog', '$state',
        function ($scope, appointmentsServiceService, messagingService, ngDialog, $state) {
            $scope.service = $scope.ngDialogData.service;

            $scope.deleteServiceConfirmation = function () {
                return appointmentsServiceService.deleteAppointmentService($scope.service.uuid).then(function () {
                    messagingService.showMessage('info', "{{'APPOINTMENT_SERVICE_DELETE_SUCCESS_MESSAGE_KEY' | translate}}");
                    ngDialog.close();
                    $state.reload();
                }, function () {
                    ngDialog.close();
                });
            };

            $scope.cancelDeleteService = function () {
                ngDialog.close();
            };
        }]);
