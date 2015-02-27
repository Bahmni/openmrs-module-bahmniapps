'use strict';

angular.module('bahmni.reports')
    .controller('DashboardController', ['$scope', 'appService', 'reportService', function ($scope, appService, reportService) {

        appService.loadConfig('reports').then(function (response) {
            $scope.reports = response.data;
        });

        $scope.runReport = function (report) {
            report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate).toString();
            report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate).toString();
            reportService.generateReport(report);
            };
        }]);
