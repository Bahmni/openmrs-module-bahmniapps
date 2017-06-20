'use strict';

angular.module('bahmni.ot')
    .controller('calendarViewController', ['$scope', '$rootScope', '$state', 'appService', 'patientService', 'locationService',
        function ($scope, $rootScope, $state, appService, patientService, locationService) {
            var init = function () {
                $scope.filterParams = $state.filterParams;
                $scope.filters = {'locations': {"OT 1": true, "OT 2": true, "OT 3": true}};
                $scope.filters.providers = [];
                $scope.surgeonList = _.map($rootScope.surgeons, function (surgeon) {
                    var newVar = {
                        name: surgeon.person.display,
                        uuid: surgeon.uuid
                    };
                    newVar[surgeon.person.display] = false;
                    var otCalendarAttribute = _.find(surgeon.attributes, function (attribute) {
                        return attribute.attributeType.display === 'otCalendarColor';
                    });
                    newVar.otCalendarColor = otCalendarAttribute && otCalendarAttribute.value;
                    return newVar;
                });
                $scope.filters.statusList = [];
                $scope.appointmentStatusList = [{name: "SCHEDULED"}, {name: "COMPLETED"}];
                return locationService.getAllByTag('Operation Theater').then(function (response) {
                    $scope.locations = response.data.results;
                    $scope.filters = $scope.filterParams || $scope.filters;
                    $scope.applyFilters();
                    return $scope.locations;
                });
            };

            $scope.applyFilters = function () {
                $scope.filterParams = _.cloneDeep($scope.filters);
                $state.filterParams = $scope.filterParams;
            };

            $scope.clearFilters = function () {
                $scope.filters.locations = {"OT 1": true, "OT 2": true, "OT 3": true};
                $scope.filters.providers = [];
                $scope.filters.statusList = [];
                $scope.patient = "";
                $scope.filters.patient = null;
                $scope.applyFilters();
            };

            $scope.search = function () {
                return patientService.search($scope.patient).then(function (response) {
                    return response.data.pageOfResults;
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.filters.patient = data;
            };

            $scope.clearThePatientFilter = function () {
                $scope.filters.patient = null;
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            $scope.goToNewSurgicalAppointment = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("newSurgicalAppointment", options);
            };
            $scope.viewDate = $state.viewDate || (moment().startOf('day')).toDate();
            $state.viewDate = $scope.viewDate;
            $scope.calendarConfig = appService.getAppDescriptor().getConfigValue("calendarView");
            $scope.goToPreviousDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.subtractDays(date, 1);
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToCurrentDate = function () {
                $scope.viewDate = new Date(moment().startOf('day'));
                $state.viewDate = $scope.viewDate;
            };

            $scope.goToNextDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.addDays(date, 1);
                $state.viewDate = $scope.viewDate;
            };

            init();
        }]);
