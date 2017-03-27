'use strict';

angular.module('bahmni.admin')
    .controller('auditLogController', ['$scope', 'spinner', '$http', 'messagingService',
        function ($scope, spinner, $http, messagingService) {
            var auditLogUrl = Bahmni.Common.Constants.adminUrl + "/auditLog";
            var DateUtil = Bahmni.Common.Util.DateUtil;

            var updateIndex = function (defaultFirstIndex, defaultLastIndex) {
                $scope.firstIndex = $scope.logs.length ? _.first($scope.logs).auditLogId : defaultFirstIndex;
                $scope.lastIndex = $scope.logs.length ? _.last($scope.logs).auditLogId : defaultLastIndex;
            };

            var getDate = function () {
                var date = $scope.startDate || new Date();
                if ($scope.startTime) {
                    date.setHours($scope.startTime.getHours());
                    date.setMinutes($scope.startTime.getMinutes());
                } else {
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                }
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
                    var data = response.data;
                    if (data.length == 0) {
                        $scope.message = "No matching event found";
                        messagingService.showMessage("error", "No matching event found");
                    } else {
                        $scope.message = "";
                        data.forEach(function (log) {
                            log.dateCreated = convertToLocalDate(log.dateCreated);
                        });
                    }
                    $scope.logs = data;
                });
            };

            var defaultView = function (params) {
                var promise = getLogs(params).then(function () {
                    $scope.logs = $scope.logs.reverse();
                    updateIndex(0, 0);
                });
                spinner.forPromise(promise);
            };

            $scope.next = function () {
                var promise = getLogs({lastAuditLogId: $scope.lastIndex}).then(function () {
                    updateIndex($scope.lastIndex + 1, $scope.lastIndex);
                });
                spinner.forPromise(promise);
            };

            $scope.prev = function () {
                if (!$scope.firstIndex && !$scope.lastIndex) {
                    defaultView();
                } else {
                    var promise = getLogs({lastAuditLogId: $scope.firstIndex, prev: true}).then(function () {
                        updateIndex(-1, 0);
                    });
                    spinner.forPromise(promise);
                }
            };

            $scope.today = DateUtil.getDateWithoutTime(DateUtil.now());

            $scope.runReport = function () {
                var startDateTime = getDate();
                var promise = getLogs({
                    username: $scope.username, patientId: $scope.patientId,
                    startFrom: startDateTime
                }).then(function () {
                    updateIndex($scope.firstIndex, $scope.lastIndex);
                });
                spinner.forPromise(promise);
            };

            var init = function () {
                defaultView({startFrom: getDate()});
            };

            init();
        }]);
