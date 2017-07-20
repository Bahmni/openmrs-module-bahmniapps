'use strict';

angular.module('bahmni.reports')
    .controller('MyReportsController', ['$scope', 'reportService', 'messagingService', 'spinner', 'ngDialog', function ($scope, reportService, messagingService, spinner, ngDialog) {
        $scope.reports = null;
        $scope.days = null;
        $scope.searchString = "";

        var init = function () {
            spinner.forPromise(reportService.getScheduledReports()).then(function (response) {
                $scope.reports = sortAllGroupedReports(getReportsGroupedByDay(response.data));
                $scope.days = getDaysInSortedOrder($scope.reports);
            }, function (response) {

            });
        };

        var sortAllGroupedReports = function (reports) {
            _.forOwn(reports, function (value, key) {
                reports[key] = _.sortBy(value, ['requestDatetime']).reverse();
            });
            return reports;
        };

        var getReportsGroupedByDay = function (reports) {
            return _.groupBy(reports, function (report) {
                report.hidden = false;
                var dateFormat = "MMM D YYYY";
                var date = moment(report.requestDatetime).format(dateFormat);
                return moment(date, dateFormat).unix() * 1000;
            });
        };

        var getDaysInSortedOrder = function (reports) {
            var days = Object.keys(reports).sort().reverse();
            return _.map(days, function (day) {
                return {
                    unixTimeStamp: parseInt(day, 10),
                    hidden: false
                };
            });
        };

        $scope.getDownloadLink = function (report) {
            return Bahmni.Common.Constants.reportsUrl + '/download/' + report.id;
        };

        $scope.convertToDate = function (unixTimeStamp, format) {
            return moment(unixTimeStamp).format(format);
        };

        $scope.getFormat = function (mimeType) {
            return reportService.getFormatForMimeType(mimeType);
        };

        $scope.search = function () {
            _.forEach($scope.days, function (day) {
                var hiddenReports = 0;
                _.forEach($scope.reports[day.unixTimeStamp], function (report) {
                    if (report.name.match(new RegExp($scope.searchString, "i")) === null) {
                        report.hidden = true;
                        hiddenReports++;
                    } else {
                        report.hidden = false;
                    }
                });
                day.hidden = hiddenReports === $scope.reports[day.unixTimeStamp].length;
            });
        };

        $scope.delete = function (reportToDelete, day) {
            spinner.forPromise(reportService.deleteReport(reportToDelete.id)).then(function () {
                _.remove($scope.reports[day.unixTimeStamp], function (report) {
                    return reportToDelete.id === report.id;
                });
                messagingService.showMessage("info", "REPORT_DELETE_SUCCESSFUL");
            }, function () {
                messagingService.showMessage("error", "REPORT_DELETE_ERROR");
            });
        };

        $scope.displayErrorPopup = function (report) {
            ngDialog.open({
                template: 'views/errorMessagePopup.html',
                className: "ngdialog-theme-default report",
                data: report.errorMessage
            });
        };

        init();
    }]);
