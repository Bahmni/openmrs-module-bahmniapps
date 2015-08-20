'use strict';

angular.module('bahmni.reports')
    .controller('DashboardController', ['$scope', 'appService', 'reportService', function ($scope, appService, reportService) {

        appService.loadConfig('reports.json').then(function (response) {
            $scope.reportsRequiringDateRange = _.values(response).filter(function(report) {
               return !(report.config && report.config.dateRangeRequired === false);
            });
            $scope.reportsNotRequiringDateRange = _.values(response).filter(function(report) {
                return (report.config && report.config.dateRangeRequired === false);
            });
            $scope.reportsDefined = _.values(response).length > 0;
        });

        $scope.default = {reportsRequiringDateRange: {}, reportsNotRequiringDateRange: {}};

        $scope.reportsDefined = true;

        $scope.setDefault = function (item, header) {
            var setToChange = header === 'reportsRequiringDateRange'? $scope.reportsRequiringDateRange: $scope.reportsNotRequiringDateRange;
            setToChange.forEach(function (report) {
                report[item] = $scope.default[header][item];
            });
        };

        $scope.runReport = function (report) {
            report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate);
            report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate);
            reportService.generateReport(report);
        };
    }]);
