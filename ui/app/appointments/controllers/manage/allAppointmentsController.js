'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$location', '$state', '$stateParams', 'appService', 'appointmentsServiceService', 'spinner',
        function ($scope, $location, $state, $stateParams, appService, appointmentsServiceService, spinner) {
            var init = function () {
                spinner.forPromise(appointmentsServiceService.getAllServicesWithServiceTypes().then(function (response) {
                    $scope.servicesWithTypes = response.data;
                    $scope.specialities = _.groupBy(response.data, function (service) {
                        return service.speciality.name || "No Speciality";
                    });
                    $scope.mappedSpecialities = _.map($scope.specialities, function (speciality, key) {
                        return {
                            label: key,
                            value: speciality[0].speciality.uuid || "",
                            children: _.map(speciality, function (service) {
                                return {
                                    label: service.name, value: service.uuid,
                                    children: _.map(service.serviceTypes, function (serviceType) {
                                        return {label: serviceType.name, value: serviceType.uuid};
                                    })
                                };
                            })
                        };
                    });
                }));
            };

            $scope.applyFilter = function () {
                $state.params.filterParams = _.reduce($scope.selectedSpecialities, function (filterParams, speciality) {
                    var serviceUuids = _.chain(speciality.children)
                        .filter(function (service) {
                            return service.selected;
                        }).map(function (service) {
                            return service.value;
                        }).value();
                    return {serviceUuids: _.concat(filterParams.serviceUuids, serviceUuids)};
                }, {serviceUuids: []});
            };

            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                var path = 'home.manage.appointments.' + viewName;
                $state.go(path, $state.params, {reload: false});
            };

            $scope.setSelectedSpecialities = function (selectedSpecialities) {
                $scope.selectedSpecialities = selectedSpecialities;
            };

            $scope.getCurrentAppointmentTabName = function () {
                return $state.current.tabName;
            };

            init();
        }]);
