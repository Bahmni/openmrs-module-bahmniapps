'use strict';

angular.module('bahmni.ot')
    .controller('listViewController', ['$scope', '$rootScope', '$q', 'spinner', 'surgicalAppointmentService', 'surgicalAppointmentHelper', 'surgicalBlockFilter',
        function ($scope, $rootScope, $q, spinner, surgicalAppointmentService, surgicalAppointmentHelper, surgicalBlockFilter) {
            var startDatetime = moment($scope.viewDate).toDate();
            var surgicalBlockMapper = new Bahmni.OT.SurgicalBlockMapper();
            var endDatetime = moment(startDatetime).endOf('day').toDate();
            var init = function (startDatetime, endDatetime) {
                $scope.addActualTimeDisabled = true;
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.reverseSort = false;
                return $q.all([surgicalAppointmentService.getSurgicalBlocksInDateRange(startDatetime, endDatetime)]).then(function (response) {
                    var surgicalBlocks = response[0].data.results;
                    var mappedSurgicalBlocks = _.map(surgicalBlocks, function (surgicalBlock) {
                        return surgicalBlockMapper.map(surgicalBlock, $rootScope.attributeTypes, $rootScope.surgeons);
                    });
                    mappedSurgicalBlocks = _.map(mappedSurgicalBlocks, function (surgicalBlock) {
                        var blockStartDatetime = surgicalBlock.startDatetime;
                        surgicalBlock.surgicalAppointments = _.map(surgicalBlock.surgicalAppointments, function (appointment) {
                            var mappedAppointment = _.cloneDeep(appointment);
                            mappedAppointment.surgicalBlock = surgicalBlock;
                            mappedAppointment.derivedAttributes = {};

                            var estTimeHours = mappedAppointment.surgicalAppointmentAttributes['estTimeHours'] && mappedAppointment.surgicalAppointmentAttributes['estTimeHours'].value;
                            var estTimeMinutes = mappedAppointment.surgicalAppointmentAttributes['estTimeMinutes'] && mappedAppointment.surgicalAppointmentAttributes['estTimeMinutes'].value;
                            var cleaningTime = mappedAppointment.surgicalAppointmentAttributes['cleaningTime'] && mappedAppointment.surgicalAppointmentAttributes['cleaningTime'].value;

                            mappedAppointment.derivedAttributes.duration = surgicalAppointmentHelper.getAppointmentDuration(
                                estTimeHours, estTimeMinutes, cleaningTime
                            );

                            mappedAppointment.derivedAttributes.expectedStartDatetime = blockStartDatetime;
                            mappedAppointment.derivedAttributes.expectedStartDate = moment(blockStartDatetime).startOf('day').toDate();
                            mappedAppointment.derivedAttributes.patientIdentifier = mappedAppointment.patient.display.split(' - ')[0];
                            mappedAppointment.derivedAttributes.patientName = mappedAppointment.patient.display.split(' - ')[1];
                            if (mappedAppointment.status === Bahmni.OT.Constants.completed || mappedAppointment.status === Bahmni.OT.Constants.scheduled) {
                                mappedAppointment.derivedAttributes.expectedStartTime = blockStartDatetime;
                                blockStartDatetime = Bahmni.Common.Util.DateUtil.addMinutes(blockStartDatetime, mappedAppointment.derivedAttributes.duration);
                            }
                            return mappedAppointment;
                        });
                        return surgicalBlock;
                    });

                    var filteredSurgicalBlocks = surgicalBlockFilter(mappedSurgicalBlocks, $scope.filterParams);
                    var surgicalAppointmentList = _.reduce(filteredSurgicalBlocks, function (surgicalAppointmentList, block) {
                        return surgicalAppointmentList.concat(block.surgicalAppointments);
                    }, []);

                    var filteredSurgicalAppointmentsByStatus = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(
                        surgicalAppointmentList, _.map($scope.filterParams.statusList, function (status) {
                            return status.name;
                        }));

                    var filteredSurgicalAppointmentsByPatient = surgicalAppointmentHelper.filterSurgicalAppointmentsByPatient(
                        filteredSurgicalAppointmentsByStatus, $scope.filterParams.patient);
                    $scope.surgicalAppointmentList = _.sortBy(filteredSurgicalAppointmentsByPatient, ["derivedAttributes.expectedStartDate", "surgicalBlock.location.name", "derivedAttributes.expectedStartDatetime"]);
                });
            };

            $scope.sortSurgicalAppointmentsBy = function (sortColumn) {
                $scope.surgicalAppointmentList = _.sortBy($scope.surgicalAppointmentList, [sortColumn]);
                if ($scope.reverseSort) {
                    $scope.surgicalAppointmentList.reverse();
                }
                $scope.sortColumn = sortColumn;
                $scope.reverseSort = !$scope.reverseSort;
            };

            $scope.selectSurgicalAppointment = function ($event, appointment) {
                $scope.$emit("event:surgicalAppointmentSelect", appointment, appointment.surgicalBlock);
                $event.stopPropagation();
            };

            $scope.deselectSurgicalAppointment = function ($event) {
                $scope.$emit("event:surgicalBlockDeselect");
                $event.stopPropagation();
            };

            $scope.$watch("viewDate", function () {
                if ($scope.weekOrDay === 'day') {
                    startDatetime = moment($scope.viewDate).toDate();
                    endDatetime = moment(startDatetime).endOf('day').toDate();
                    spinner.forPromise(init(startDatetime, endDatetime));
                }
            });

            $scope.$watch("weekStartDate", function () {
                if ($scope.weekOrDay === 'week') {
                    startDatetime = moment($scope.weekStartDate).toDate();
                    endDatetime = moment($scope.weekEndDate).toDate();
                    spinner.forPromise(init(startDatetime, endDatetime));
                }
            });

            $scope.$watch("filterParams", function (oldValue, newValue) {
                if (oldValue !== newValue) {
                    spinner.forPromise(init(startDatetime, endDatetime));
                }
            });

            spinner.forPromise(init(startDatetime, endDatetime));
        }]);
