'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsSummaryController', ['$scope', '$state', '$window', 'spinner', 'appointmentsService', 'appService',
        function ($scope, $state, $window, spinner, appointmentsService, appService) {
            var init = function () {
                $scope.viewDate = $state.params.viewDate || moment().startOf('day').toDate();
                var weekStartDay = appService.getAppDescriptor().getConfigValue('startOfWeek') || Bahmni.Appointments.Constants.defaultWeekStartDayName;
                $scope.weekStart = Bahmni.Appointments.Constants.weekDays[weekStartDay];
            };

            $scope.getAppointmentsSummaryForAWeek = function (startDate, endDate) {
                $scope.weekStartDate = startDate;
                $scope.weekEndDate = endDate;
                var params = {
                    startDate: startDate,
                    endDate: endDate
                };
                spinner.forPromise(appointmentsService.getAppointmentsSummary(params).then(function (response) {
                    $scope.appointments = response.data;
                    setWeekDatesInfo();
                }));
                $state.params.viewDate = $scope.viewDate;
            };

            $scope.goToListView = function (date, service) {
                var params = {
                    viewDate: moment(date).toDate(),
                    filterParams: {statusList: _.without(Bahmni.Appointments.Constants.appointmentStatusList, "Cancelled")}
                };
                if (!_.isUndefined(service)) {
                    params.filterParams.serviceUuids = [service.uuid];
                }
                $state.go('home.manage.appointments.list', params);
            };

            $scope.isCurrentDate = function (date) {
                return moment(date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
            };

            var setWeekDatesInfo = function () {
                $scope.weekDatesInfo = [];
                for (var i = $scope.weekStartDate;
                     Bahmni.Common.Util.DateUtil.isBeforeDate(i, $scope.weekEndDate);
                     i = Bahmni.Common.Util.DateUtil.addDays(i, 1)) {
                    var weekDate = {date: moment(i).format("YYYY-MM-DD")};
                    weekDate.total = _.reduce($scope.appointments, function (total, appointment) {
                        var appointmentCount = appointment.appointmentCountMap[weekDate.date];
                        if (!appointmentCount) {
                            return total;
                        }
                        return {
                            all: appointmentCount.allAppointmentsCount + total.all,
                            missed: appointmentCount.missedAppointmentsCount + total.missed
                        };
                    }, {all: 0, missed: 0});
                    $scope.weekDatesInfo.push(weekDate);
                }
            };

            return init();
        }]);
