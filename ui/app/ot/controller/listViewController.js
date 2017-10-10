'use strict';

angular.module('bahmni.ot')
    .controller('listViewController', ['$scope', '$rootScope', '$q', 'spinner', 'surgicalAppointmentService', 'appService', 'surgicalAppointmentHelper', 'surgicalBlockFilter', 'printer',
        function ($scope, $rootScope, $q, spinner, surgicalAppointmentService, appService, surgicalAppointmentHelper, surgicalBlockFilter, printer) {
            var startDatetime = moment($scope.viewDate).toDate();
            var surgicalBlockMapper = new Bahmni.OT.SurgicalBlockMapper();
            var endDatetime = moment(startDatetime).endOf('day').toDate();
            $scope.tableInfo = [
                {heading: 'Status', sortInfo: 'status'},
                {heading: 'Date', sortInfo: 'derivedAttributes.expectedStartDate'},
                {heading: 'Identifier', sortInfo: 'derivedAttributes.patientIdentifier'},
                {heading: 'Patient Name', sortInfo: 'derivedAttributes.patientName'},
                {heading: 'Start Time', sortInfo: 'derivedAttributes.expectedStartTime'},
                {heading: 'Est Time', sortInfo: 'derivedAttributes.duration'},
                {heading: 'Actual Time', sortInfo: 'actualStartDatetime'},
                {heading: 'OT#', sortInfo: 'surgicalBlock.location.name'},
                {heading: 'Procedure(s)', sortInfo: 'surgicalAppointmentAttributes.procedure.value'},
                {heading: 'Notes', sortInfo: 'surgicalAppointmentAttributes.notes.value'},
                {heading: 'Surgeon', sortInfo: 'surgicalBlock.provider.person.display'},
                {heading: 'Other Surgeon', sortInfo: 'surgicalAppointmentAttributes.otherSurgeon.value.person.display'},
                {heading: 'Surgical Assistant', sortInfo: 'surgicalAppointmentAttributes.surgicalAssistant.value'},
                {heading: 'Anaesthetist', sortInfo: 'surgicalAppointmentAttributes.anaesthetist.value'},
                {heading: 'Scrub Nurse', sortInfo: 'surgicalAppointmentAttributes.scrubNurse.value'},
                {heading: 'Circulating Nurse', sortInfo: 'surgicalAppointmentAttributes.circulatingNurse.value'},
                {heading: 'Status Change Notes', sortInfo: 'notes'}];

            var filterSurgicalBlocksAndMapAppointmentsForDisplay = function (surgicalBlocks) {
                var clonedSurgicalBlocks = _.cloneDeep(surgicalBlocks);
                var filteredSurgicalBlocks = surgicalBlockFilter(clonedSurgicalBlocks, $scope.filterParams);
                var mappedSurgicalBlocks = _.map(filteredSurgicalBlocks, function (surgicalBlock) {
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

                var surgicalAppointmentList = _.reduce(mappedSurgicalBlocks, function (surgicalAppointmentList, block) {
                    return surgicalAppointmentList.concat(block.surgicalAppointments);
                }, []);

                var filteredSurgicalAppointmentsByStatus = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(
                    surgicalAppointmentList, _.map($scope.filterParams.statusList, function (status) {
                        return status.name;
                    }));

                var filteredSurgicalAppointmentsByPatient = surgicalAppointmentHelper.filterSurgicalAppointmentsByPatient(
                    filteredSurgicalAppointmentsByStatus, $scope.filterParams.patient);
                $scope.surgicalAppointmentList = _.sortBy(filteredSurgicalAppointmentsByPatient, ["derivedAttributes.expectedStartDate", "surgicalBlock.location.name", "derivedAttributes.expectedStartDatetime"]);
            };

            var init = function (startDatetime, endDatetime) {
                $scope.addActualTimeDisabled = true;
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.reverseSort = false;
                $scope.sortColumn = "";
                return $q.all([surgicalAppointmentService.getSurgicalBlocksInDateRange(startDatetime, endDatetime, true)]).then(function (response) {
                    $scope.surgicalBlocks = response[0].data.results;
                    filterSurgicalBlocksAndMapAppointmentsForDisplay($scope.surgicalBlocks);
                });
            };

            $scope.isCurrentDateinWeekView = function (appointmentDate) {
                return _.isEqual(moment().startOf('day').toDate(), appointmentDate) && $scope.weekOrDay === 'week';
            };
            $scope.printPage = function () {
                var printTemplateUrl = appService.getAppDescriptor().getConfigValue("printListViewTemplateUrl") || 'views/listView.html';
                printer.print(printTemplateUrl, {
                    surgicalAppointmentList: $scope.surgicalAppointmentList,
                    weekStartDate: $scope.weekStartDate,
                    weekEndDate: $scope.weekEndDate,
                    viewDate: $scope.viewDate,
                    weekOrDay: $scope.weekOrDay,
                    isCurrentDate: $scope.isCurrentDateinWeekView
                });
            };

            $scope.sortSurgicalAppointmentsBy = function (sortColumn) {
                var emptyObjects = _.filter($scope.surgicalAppointmentList, function (appointment) {
                    return !_.property(sortColumn)(appointment);
                });
                var nonEmptyObjects = _.difference($scope.surgicalAppointmentList, emptyObjects);
                var sortedNonEmptyObjects = _.sortBy(nonEmptyObjects, sortColumn);
                if ($scope.reverseSort) {
                    sortedNonEmptyObjects.reverse();
                }
                $scope.surgicalAppointmentList = sortedNonEmptyObjects.concat(emptyObjects);
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
                    filterSurgicalBlocksAndMapAppointmentsForDisplay($scope.surgicalBlocks);
                }
            });

            $scope.isStatusPostponed = function (status) {
                return status === Bahmni.OT.Constants.postponed;
            };

            $scope.isStatusCancelled = function (status) {
                return status === Bahmni.OT.Constants.cancelled;
            };

            spinner.forPromise(init(startDatetime, endDatetime));
        }]);
