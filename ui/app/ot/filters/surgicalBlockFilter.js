'use strict';

angular.module('bahmni.ot')
    .filter('surgicalBlock', [function () {
        var filterByLocation = function (surgicalBlocks, filters) {
            var blocksFilteredByLocation = [];
            _.forEach(surgicalBlocks, function (block) {
                filters.locations[block.location.name] ? blocksFilteredByLocation.push(block) : '';
            });
            return blocksFilteredByLocation;
        };

        var filterByProvider = function (blocksFilteredByLocation, filters) {
            if (_.isEmpty(filters.providers)) {
                return blocksFilteredByLocation;
            }
            var blocksFilteredByProvider = _.filter(blocksFilteredByLocation, function (block) {
                return _.find(filters.providers, function (provider) {
                    return provider.uuid === block.provider.uuid;
                });
            });
            return blocksFilteredByProvider;
        };

        var filterByPatientUuid = function (blocksFilteredByProviders, filters) {
            if (_.isEmpty(filters.patient)) {
                return blocksFilteredByProviders;
            }
            return _.filter(blocksFilteredByProviders, function (block) {
                return _.find(block.surgicalAppointments, function (appointment) {
                    return appointment.patient.uuid === filters.patient.uuid;
                });
            });
        };

        var filterByAppointmentStatus = function (blocksFilteredByPatient, filters) {
            if (_.isEmpty(filters.statusList)) {
                return blocksFilteredByPatient;
            }
            return _.filter(blocksFilteredByPatient, function (block) {
                return _.find(block.surgicalAppointments, function (appointment) {
                    return _.find(filters.statusList, function (status) {
                        return status.name === appointment.status;
                    });
                });
            });
        };

        var filterByPatientAndStatus = function (blocksFilteredByProviders, filters) {
            if (_.isEmpty(filters.statusList) || _.isEmpty(filters.patient)) {
                var blocksFilteredByPatient = filterByPatientUuid(blocksFilteredByProviders, filters);
                return filterByAppointmentStatus(blocksFilteredByPatient, filters);
            }
            return _.filter(blocksFilteredByProviders, function (block) {
                return _.find(block.surgicalAppointments, function (appointment) {
                    return appointment.patient.uuid === filters.patient.uuid && _.find(filters.statusList, function (status) {
                        return status.name === appointment.status;
                    });
                });
            });
        };
        return function (surgicalBlocks, filters) {
            if (!filters) {
                return surgicalBlocks;
            }
            var blocksFilteredByLocation = filterByLocation(surgicalBlocks, filters);
            var blocksFilteredByProviders = filterByProvider(blocksFilteredByLocation, filters);
            return filterByPatientAndStatus(blocksFilteredByProviders, filters);
        };
    }]);
