'use strict';

angular.module('bahmni.appointments')
    .directive('serviceTypes', ['ngDialog', 'messagingService', 'appointmentsService', function (ngDialog, messagingService, appointmentsService) {
        var controller = function ($scope) {
            $scope.serviceType = {};

            $scope.updateServiceTypeDuration = function () {
                if (!_.isEmpty($scope.serviceType.name)) {
                    $scope.serviceType.duration = $scope.serviceType.duration || Bahmni.Appointments.Constants.defaultServiceTypeDuration;
                } else {
                    $scope.serviceType.duration = undefined;
                    $scope.serviceTypesForm.serviceTypeName.$setValidity('uniqueServiceTypeName', true);
                }
            };

            var validateServiceType = function (serviceType) {
                var nonVoidedServiceTypes = _.filter($scope.service.serviceTypes, function (serviceType) {
                    return !serviceType.voided;
                });
                return (!_.find(nonVoidedServiceTypes, serviceType));
            };

            $scope.addServiceType = function (serviceType) {
                if (validateServiceType(serviceType)) {
                    $scope.service.serviceTypes.push({name: serviceType.name, duration: serviceType.duration ? serviceType.duration : 0});
                    $scope.serviceType = {name: undefined, duration: undefined};
                    $scope.serviceTypesForm.serviceTypeName.$setValidity('uniqueServiceTypeName', true);
                } else {
                    $scope.serviceTypesForm.serviceTypeName.$setValidity('uniqueServiceTypeName', false);
                }
            };

            var openConfirmationDialog = function (serviceType) {
                ngDialog.openConfirm({
                    template: 'views/admin/serviceTypeDeleteConfirmation.html',
                    scope: $scope,
                    data: {serviceType: serviceType},
                    closeByEscape: true
                });
            };

            $scope.deleteServiceType = function (serviceType) {
                if (_.isEmpty(serviceType.uuid)) {
                    openConfirmationDialog(serviceType);
                } else {
                    appointmentsService.getAppointmentsForServiceType(serviceType.uuid).then(function (response) {
                        if (response.data.length) {
                            messagingService.showMessage('error', "APPOINTMENT_SERVICE_TYPE_DELETE_CONFIRMATION_DIALOG_MESSAGE_KEY");
                        } else {
                            openConfirmationDialog(serviceType);
                        }
                    });
                }
            };

            $scope.deleteServiceTypeOnConfirmation = function (serviceType) {
                if (_.isEmpty(serviceType.uuid)) {
                    _.remove($scope.service.serviceTypes, serviceType);
                } else {
                    serviceType.voided = true;
                }
                ngDialog.close();
            };

            $scope.cancelTransition = function () {
                ngDialog.close();
            };
        };

        return {
            restrict: 'E',
            scope: {
                service: '='
            },
            templateUrl: "../appointments/views/admin/serviceTypes.html",
            controller: controller
        };
    }]);

