'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsFilterController', ['$scope', '$state', '$q', 'appointmentsServiceService', 'spinner', 'ivhTreeviewMgr', 'providerService',
        function ($scope, $state, $q, appointmentsServiceService, spinner, ivhTreeviewMgr, providerService) {
            var init = function () {
                $scope.statusList = _.map(Bahmni.Appointments.Constants.appointmentStatusList, function (status) {
                    return {name: status, value: status};
                });
                spinner.forPromise($q.all([appointmentsServiceService.getAllServicesWithServiceTypes(), providerService.list()]).then(function (response) {
                    $scope.providers = _.filter(response[1].data.results, function (provider) {
                        return provider.display;
                    }).map(function (provider) {
                        provider.name = provider.display;
                        return provider;
                    });

                    $scope.specialities = _.groupBy(response[0].data, function (service) {
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

            var resetFilterParams = function () {
                $state.params.filterParams = { serviceUuids: [], serviceTypeUuids: [], providerUuids: [], statusList: [] };
            };

            $scope.setSelectedSpecialities = function (selectedSpecialities) {
                $scope.selectedSpecialities = selectedSpecialities;
            };

            $scope.getCurrentAppointmentTabName = function () {
                return $state.current.tabName;
            };

            $scope.resetFilter = function () {
                if ($scope.selectedSpecialities) {
                    ivhTreeviewMgr.deselectAll($scope.selectedSpecialities, false);
                }
                $scope.selectedProviders = [];
                $scope.selectedStatusList = [];
                resetFilterParams();
            };

            $scope.applyFilter = function () {
                resetFilterParams();
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

                $state.params.filterParams.providerUuids = _.map($scope.selectedProviders, function (provider) {
                    return provider.uuid;
                });

                $state.params.filterParams.statusList = _.map($scope.selectedStatusList, function (status) {
                    return status.value;
                });
            };

            init();
        }]);
