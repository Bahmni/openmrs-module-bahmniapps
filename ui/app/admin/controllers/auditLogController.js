'use strict';

angular.module('bahmni.admin')
    .controller('auditLogController', ['$scope', 'spinner', '$http',
        function ($scope, spinner, $http) {
            var auditLogUrl = Bahmni.Common.Constants.adminUrl + "/auditLog";
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var defaultMessage = "";

            var updateIndex = function (logs, defaultFirstIndex, defaultLastIndex) {
                $scope.firstIndex = logs.length ? _.first(logs).auditLogId : defaultFirstIndex;
                $scope.lastIndex = logs.length ? _.last(logs).auditLogId : defaultLastIndex;
            };

            var setMessage = function (logsLength, message) {
                $scope.errorMessage = logsLength ? defaultMessage : message;
            };

            var updatePage = function (logs, defaultFirstIndex, defaultLastIndex) {
                if (logs.length) {
                    $scope.logs = logs;
                }
                setMessage(logs.length, "No records to display !!");
                updateIndex(logs, defaultFirstIndex, defaultLastIndex);
            };

            var getDate = function () {
                var date = $scope.startDate || $scope.today;
                $scope.startDate = date;
                return date;
            };

            var convertToLocalDate = function (date) {
                var localDate = DateUtil.parseLongDateToServerFormat(date);
                return DateUtil.getDateTimeInSpecifiedFormat(localDate, 'MMMM Do, YYYY [at] h:mm:ss A');
            };

            var getLogs = function (params) {
                params = params || {};
                return $http.get(auditLogUrl, {params: params}).then(function (response) {
                    return response.data.map(function (log) {
                        log.dateCreated = convertToLocalDate(log.dateCreated);
                        return log;
                    });
                });
            };

            var defaultView = function (params) {
                var promise = getLogs(params).then(function (logs) {
                    logs.reverse();
                    updatePage(logs, 0, 0);
                });
                spinner.forPromise(promise);
            };

            $scope.next = function () {
                var promise = getLogs({lastAuditLogId: $scope.lastIndex}).then(function (logs) {
                    updatePage(logs, $scope.firstIndex, $scope.lastIndex);
                });
                spinner.forPromise(promise);
            };

            $scope.prev = function () {
                if (!$scope.firstIndex && !$scope.lastIndex) {
                    defaultView();
                } else {
                    var promise = getLogs({lastAuditLogId: $scope.firstIndex, prev: true}).then(function (logs) {
                        updatePage(logs, $scope.firstIndex, $scope.lastIndex);
                    });
                    spinner.forPromise(promise);
                }
            };

            $scope.today = DateUtil.today();
            $scope.maxDate = DateUtil.getDateWithoutTime($scope.today);
            $scope.runReport = function () {
                var startDateTime = getDate();
                var promise = getLogs({
                    username: $scope.username, patientId: $scope.patientId,
                    startFrom: startDateTime
                }).then(function (logs) {
                    $scope.logs = logs;
                    setMessage(logs.length, "No records found for given criteria !!");
                    updateIndex(logs, 0, 0);
                });
                spinner.forPromise(promise);
            };

            var init = function () {
                $scope.logs = [];
                defaultView({startFrom: getDate()});
            };

            init();
        }]);
