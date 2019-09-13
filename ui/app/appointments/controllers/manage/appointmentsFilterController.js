'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsFilterController', ['$scope', '$state', '$rootScope', '$q', '$translate', 'appointmentsServiceService', 'spinner', 'ivhTreeviewMgr', 'providerService', 'appService',
        function ($scope, $state, $rootScope, $q, $translate, appointmentsServiceService, spinner, ivhTreeviewMgr, providerService, appService) {
            var init = function () {
                $scope.isSpecialityEnabled = appService.getAppDescriptor().getConfigValue('enableSpecialities');
                $scope.isServiceTypeEnabled = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
                $scope.isFilterOpen = $state.params.isFilterOpen;
                $scope.isSearchEnabled = $state.params.isSearchEnabled;
                $scope.statusList = _.map(Bahmni.Appointments.Constants.appointmentStatusList, function (status) {
                    return {name: status, value: status};
                });
                $scope.selectedStatusList = _.filter($scope.statusList, function (status) {
                    return _.includes($state.params.filterParams.statusList, status.value);
                });

                if ($state.current.tabName === "calendar") {
                    $scope.statusList = _.filter($scope.statusList, function (status) {
                        return status.name !== "Cancelled";
                    });
                }
                var params = {v: "custom:(display,person,uuid,retired,attributes:(attributeType:(display),value,voided))"};

                $scope.$watch("selectedProviders", function (selectedProviders) {
                    if (!_.isUndefined($scope.selectedSpecialities)) {
                        $scope.applyFilter();
                    }
                });

                $scope.$watch("selectedStatusList", function (selectedStatusList) {
                    if (!_.isUndefined($scope.selectedSpecialities)) {
                        $scope.applyFilter();
                    }
                });

                spinner.forPromise($q.all([appointmentsServiceService.getAllServicesWithServiceTypes(), providerService.list(params)]).then(function (response) {
                    $scope.providers = _.filter(response[1].data.results, function (provider) {
                        return _.find(provider.attributes, function (attribute) {
                            return !attribute.voided && !provider.retired && attribute.value && attribute.attributeType.display === Bahmni.Appointments.Constants.availableForAppointments;
                        });
                    }).map(function (provider) {
                        provider.name = provider.person.display;
                        return provider;
                    });
                    $scope.providers.push({
                        name: $translate.instant("NO_PROVIDER_COLUMN_KEY"),
                        display: $translate.instant("NO_PROVIDER_COLUMN_KEY"),
                        uuid: 'no-provider-uuid'
                    });

                    if ($scope.isSpecialityEnabled) {
                        $scope.specialities = _.groupBy(response[0].data, function (service) {
                            return service.speciality.name || $translate.instant("NO_SPECIALITY_KEY");
                        });
                        $scope.selectedSpecialities = _.map($scope.specialities, function (speciality, key) {
                            return {
                                label: key,
                                id: speciality[0].speciality.uuid || "",
                                children: _.map(speciality, function (service) {
                                    return {
                                        label: service.name, id: service.uuid, color: service.color,
                                        children: !$scope.isServiceTypeEnabled ? [] : _.map(service.serviceTypes, function (serviceType) {
                                            return {
                                                label: serviceType.name + ' [' + serviceType.duration + ' ' + $translate.instant("PLACEHOLDER_SERVICE_TYPE_DURATION_MIN") + ']',
                                                id: serviceType.uuid
                                            };
                                        })
                                    };
                                })
                            };
                        });
                    } else {
                        $scope.selectedSpecialities = _.map(response[0].data, function (service) {
                            return {
                                label: service.name, id: service.uuid, color: service.color,
                                children: !$scope.isServiceTypeEnabled ? [] : _.map(service.serviceTypes, function (serviceType) {
                                    return {
                                        label: serviceType.name + ' [' + serviceType.duration + ' ' + $translate.instant("PLACEHOLDER_SERVICE_TYPE_DURATION_MIN") + ']',
                                        id: serviceType.uuid
                                    };
                                })
                            };
                        });
                    }

                    $scope.selectedProviders = _.filter($scope.providers, function (provider) {
                        return _.includes($state.params.filterParams.providerUuids, provider.uuid);
                    });

                    if (!_.isEmpty($state.params.filterParams)) {
                        ivhTreeviewMgr.selectEach($scope.selectedSpecialities, $state.params.filterParams.serviceUuids);
                    }
                }));
            };

            $scope.filterSelected = function () {
                $scope.filterSelectedValues = $scope.showSelected ? {selected: true} : undefined;
            };

            $scope.expandFilter = function () {
                $state.params.isFilterOpen = true;
                $scope.isFilterOpen = $state.params.isFilterOpen;
                $rootScope.$broadcast("filterClosedOpen", {filterViewStatus: $scope.isFilterOpen});
            };

            $scope.minimizeFilter = function () {
                $state.params.isFilterOpen = false;
                $scope.isFilterOpen = $state.params.isFilterOpen;
                $rootScope.$broadcast("filterClosedOpen", {filterViewStatus: $scope.isFilterOpen});
            };
            var resetFilterParams = function () {
                $state.params.filterParams = {
                    serviceUuids: [],
                    serviceTypeUuids: [],
                    providerUuids: [],
                    statusList: []
                };
            };

            $scope.setSelectedSpecialities = function (selectedSpecialities) {
                $scope.selectedSpecialities = selectedSpecialities;
                $scope.applyFilter();
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
                $scope.showSelected = false;
                $scope.filterSelectedValues = undefined;
                $scope.searchText = undefined;
                resetFilterParams();
            };

            $scope.resetSearchText = function () {
                $scope.searchText = undefined;
            };

            $scope.applyFilter = function () {
                resetFilterParams();
                if ($scope.isSpecialityEnabled) {
                    $state.params.filterParams.serviceUuids = _.reduce($scope.selectedSpecialities, function (accumulator, speciality) {
                        var serviceUuids = _.chain(speciality.children)
                            .filter(function (service) {
                                return service.selected;
                            }).map(function (service) {
                                return service.id;
                            }).value();
                        return serviceUuids.concat(accumulator);
                    }, []);

                    if ($scope.isServiceTypeEnabled) {
                        $state.params.filterParams.serviceTypeUuids = _.reduce($scope.selectedSpecialities, function (accumulator, speciality) {
                            var selectedServiceTypes = _.reduce(speciality.children, function (accumulator, service) {
                                var serviceTypesForService = [];
                                if (!service.selected) {
                                    serviceTypesForService = _.filter(service.children, function (serviceType) {
                                        return serviceType.selected;
                                    }).map(function (serviceType) {
                                        return serviceType.id;
                                    });
                                }
                                return serviceTypesForService.concat(accumulator);
                            }, []);
                            return selectedServiceTypes.concat(accumulator);
                        }, []);
                    } else {
                        $state.params.filterParams.serviceTypeUuids = [];
                    }
                } else {
                    $state.params.filterParams.serviceUuids = _.chain($scope.selectedSpecialities).filter(function (service) {
                        return service.selected;
                    }).map(function (service) {
                        return service.id;
                    }).value();

                    if ($scope.isServiceTypeEnabled) {
                        $state.params.filterParams.serviceTypeUuids = $scope.selectedSpecialities.filter(function (service) {
                            return !service.selected;
                        }).reduce(function (accumulator, service) {
                            return accumulator.concat(service.children);
                        }, []).filter(function (serviceType) {
                            return serviceType.selected;
                        }).reduce(function (accumulator, serviceType) {
                            return accumulator.concat(serviceType.id);
                        }, []);
                    } else {
                        $state.params.filterParams.serviceTypeUuids = [];
                    }
                }

                $state.params.filterParams.providerUuids = _.map($scope.selectedProviders, function (provider) {
                    return provider.uuid;
                });

                $state.params.filterParams.statusList = _.map($scope.selectedStatusList, function (status) {
                    return status.value;
                });
            };

            $scope.isFilterApplied = function () {
                return _.find($state.params.filterParams, function (filterParam) {
                    return !_.isEmpty(filterParam);
                });
            };
            $scope.$watch(function () {
                return $state.params.isFilterOpen;
            }, function (isFilterHidden) {
                $scope.isFilterOpen = isFilterHidden;
                $scope.isSearchEnabled = isFilterHidden;
            }, true);

            $scope.$watch(function () {
                return $state.params.isSearchEnabled;
            }, function (isSearchEnabled) {
                $scope.isSearchEnabled = isSearchEnabled;
            }, true);

            $scope.$watch(function () {
                return $state.current.tabName;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (newValue === "calendar") {
                        $scope.statusList = _.filter($scope.statusList, function (status) {
                            return status.name !== "Cancelled";
                        });
                        $scope.selectedStatusList = _.filter($scope.selectedStatusList, function (status) {
                            return status.name !== "Cancelled";
                        });
                    } else {
                        $scope.statusList = _.map(Bahmni.Appointments.Constants.appointmentStatusList, function (status) {
                            return {name: status, value: status};
                        });
                    }
                }
            }, true);
            init();
        }]);
