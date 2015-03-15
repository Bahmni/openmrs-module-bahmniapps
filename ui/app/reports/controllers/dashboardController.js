'use strict';

angular.module('bahmni.reports')
    .controller('DashboardController', ['$scope', 'appService', 'reportService', function ($scope, appService, reportService) {

        appService.loadConfig('reports').then(function (response) {
            $scope.reports = response.data;
        });

        $scope.default = {};

        $scope.setDefault = function (item) {
            $scope.reports.forEach(function (report) {
                report[item] = $scope.default[item];
            })
        };

        $scope.runReport = function (report) {
            report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate).toString();
            report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate).toString();
            reportService.generateReport(report);
        };
    }]);
