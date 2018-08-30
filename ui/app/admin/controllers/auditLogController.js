'use strict';

angular.module('bahmni.admin')
    .controller('auditLogController', ['$scope', 'spinner', 'auditLogService', 'messagingService', '$translate', 'appService',
        function ($scope, spinner, auditLogService, messagingService, $translate, appService) {
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue('displayNepaliDates');
            $scope.enableNepaliCalendar = appService.getAppDescriptor().getConfigValue('enableNepaliCalendar');
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.npToday = DateUtil.npToday();
            var defaultMessage = "";

            var getTranslatedMessage = function (key) {
                return $translate.instant(key);
            };

            var isNotEmpty = function (value) {
                return value !== undefined && value !== "";
            };

            var mapParamsForRequest = function (params) {
                return _.pickBy(params, isNotEmpty);
            };

            var updateIndex = function (logs, defaultFirstIndex, defaultLastIndex) {
                $scope.firstIndex = logs.length ? _.first(logs).auditLogId : defaultFirstIndex;
                $scope.lastIndex = logs.length ? _.last(logs).auditLogId : defaultLastIndex;
            };

            var setMessage = function (logsLength, message) {
                $scope.errorMessage = logsLength ? defaultMessage : message;
            };

            var updatePage = function (logs, defaultFirstIndex, defaultLastIndex, message) {
                if (logs.length) {
                    $scope.logs = logs;
                }
                setMessage(logs.length, message);
                updateIndex(logs, defaultFirstIndex, defaultLastIndex);
            };

            var getDate = function () {
                var date = $scope.startDate || $scope.today;
                $scope.startDate = date;
                var dateBs = $scope.startDateBs || $scope.npToday;
                $scope.startDateBs = dateBs;
                return date;
            };

            var defaultView = function (params, message) {
                return auditLogService.getLogs(params).then(function (logs) {
                    logs.reverse();
                    updatePage(logs, 0, 0, message);
                });
            };

            $scope.next = function () {
                var params = {
                    lastAuditLogId: $scope.lastIndex,
                    username: $scope.username,
                    patientId: $scope.patientId,
                    startFrom: $scope.startDate
                };
                var promise = auditLogService.getLogs(mapParamsForRequest(params)).then(function (logs) {
                    updatePage(logs, $scope.firstIndex, $scope.lastIndex, getTranslatedMessage("NO_MORE_EVENTS_FOUND"));
                });
                spinner.forPromise(promise);
            };

            $scope.prev = function () {
                var message = getTranslatedMessage("NO_MORE_EVENTS_FOUND");
                var promise;
                if (!$scope.firstIndex && !$scope.lastIndex) {
                    promise = defaultView(mapParamsForRequest({
                        defaultView: true,
                        startFrom: $scope.startDate
                    }), message);
                } else {
                    var params = {
                        lastAuditLogId: $scope.firstIndex,
                        username: $scope.username,
                        patientId: $scope.patientId,
                        prev: true,
                        startFrom: $scope.startDate
                    };
                    promise = auditLogService.getLogs(mapParamsForRequest(params)).then(function (logs) {
                        updatePage(logs, $scope.firstIndex, $scope.lastIndex, message);
                    });
                }
                spinner.forPromise(promise);
            };

            $scope.today = DateUtil.today();
            $scope.maxDate = DateUtil.getDateWithoutTime($scope.today);
            $scope.updateAdDate = function (startDateBs) {
                var dateStr = startDateBs.split("-");
                var dateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
                $scope.startDate = new Date(dateAD);
            };
            $scope.runReport = function () {
                if ($("#startDate").hasClass("ng-invalid-max")) {
                    messagingService.showMessage("error", getTranslatedMessage("INVALID_DATE"));
                    return;
                }
                var params = {
                    username: $scope.username, patientId: $scope.patientId,
                    startFrom: $scope.startDate
                };
                var promise = auditLogService.getLogs(mapParamsForRequest(params)).then(function (logs) {
                    $scope.logs = logs;
                    setMessage(logs.length, getTranslatedMessage("MATCHING_EVENTS_NOT_FOUND"));
                    updateIndex(logs, 0, 0);
                });
                spinner.forPromise(promise);
            };

            var init = function () {
                $scope.logs = [];
                var promise = defaultView({startFrom: getDate(), defaultView: true}, getTranslatedMessage("NO_EVENTS_FOUND"));
                spinner.forPromise(promise);
            };

            init();
        }]);
