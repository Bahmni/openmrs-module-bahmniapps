'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$location', '$state', '$stateParams', 'appService', 'appointmentsServiceService', 'spinner', 'ivhTreeviewMgr',
        function ($scope, $location, $state, $stateParams, appService, appointmentsServiceService, spinner, ivhTreeviewMgr) {
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

            $scope.setFilterParams = function () {
                $state.params.filterParams = {
                    serviceUuids: [],
                    serviceTypeUuids: [],
                    providerUuids: [],
                    statusList: []
                };
            };

            $scope.applyFilter = function () {
                $scope.setFilterParams();
                $state.params.filterParams.serviceUuids = _.reduce($scope.selectedSpecialities, function (accumulator, speciality) {
                    var serviceUuids = _.chain(speciality.children)
                        .filter(function (service) {
                            return service.selected;
                        }).map(function (service) {
                            return service.value;
                        }).value();
                    return serviceUuids.concat(accumulator);
                }, []);

                $state.params.filterParams.serviceTypeUuids = _.reduce($scope.selectedSpecialities, function (accumulator, speciality) {
                    var selectedServiceTypes = _.reduce(speciality.children, function (accumulator, service) {
                        var serviceTypesForService = [];
                        if (!service.selected) {
                            serviceTypesForService = _.filter(service.children, function (serviceType) {
                                return serviceType.selected;
                            }).map(function (serviceType) {
                                return serviceType.value;
                            });
                        }
                        return serviceTypesForService.concat(accumulator);
                    }, []);
                    return selectedServiceTypes.concat(accumulator);
                }, []);
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

            $scope.resetFilter = function () {
                ivhTreeviewMgr.deselectAll($scope.selectedSpecialities, false);
                $scope.setFilterParams();
            };

            init();
        }]);
