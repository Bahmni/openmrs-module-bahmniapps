'use strict';

angular.module('bahmni.appointments')
    .directive('serviceTypes', function () {
        return {
            restrict: 'E',
            scope: {
                service: '='
            },
            templateUrl: "../appointments/views/admin/serviceTypes.html",
            link: function (scope) {
                scope.serviceType = {};

                scope.updateServiceTypeDuration = function () {
                    if (!_.isEmpty(scope.serviceType.name)) {
                        scope.serviceType.duration = scope.serviceType.duration || Bahmni.Appointments.Constants.defaultServiceTypeDuration;
                    } else {
                        scope.serviceType.duration = undefined;
                    }
                };

                var validateServiceType = function (serviceType) {
                    return (!_.find(scope.service.serviceTypes, serviceType));
                };

                scope.addServiceType = function (serviceType) {
                    if (validateServiceType(serviceType)) {
                        scope.service.serviceTypes.push({name: serviceType.name, duration: serviceType.duration ? serviceType.duration : 0});
                        scope.serviceType = {name: undefined, duration: undefined};
                        scope.serviceTypesForm.serviceTypeName.$setValidity('uniqueServiceTypeName', true);
                    } else {
                        scope.serviceTypesForm.serviceTypeName.$setValidity('uniqueServiceTypeName', false);
                    }
                };
            }
        };
    });

