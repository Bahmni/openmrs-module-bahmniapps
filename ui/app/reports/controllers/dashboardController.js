'use strict';

angular.module('bahmni.reports')
    .controller('DashboardController', ['$scope', 'appService', 'reportService', 'FileUploader', 'messagingService', function ($scope, appService, reportService, FileUploader, messagingService) {
        $scope.uploader = new FileUploader({
            url: Bahmni.Common.Constants.uploadReportTemplateUrl,
            removeAfterUpload: true,
            autoUpload: true
        });

        $scope.uploader.onSuccessItem = function (fileItem, response) {
            fileItem.report.reportTemplateLocation = response;
        };

        $scope.default = {reportsRequiringDateRange: {}, reportsNotRequiringDateRange: {}};
        $scope.reportsDefined = true;

        $scope.setDefault = function (item, header) {
            var setToChange = header === 'reportsRequiringDateRange' ? $scope.reportsRequiringDateRange : $scope.reportsNotRequiringDateRange;
            setToChange.forEach(function (report) {
                report[item] = $scope.default[header][item];
            });
        };


        var isDateRangeRequiredFor = function (report) {
            return _.find($scope.reportsRequiringDateRange, {name: report.name});

        };

        $scope.runReport = function (report) {
            if(!report.responseType){
                messagingService.showMessage("formError", "Select format for the report: " + report.name);
                return;
            }
            if (report.responseType == 'application/vnd.ms-excel-custom' && !report.reportTemplateLocation) {
                messagingService.showMessage("formError", "Workbook template should be selected for generating report: " + report.name);
                return;
            }
            report.startDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.startDate);
            report.stopDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(report.stopDate);
            if (isDateRangeRequiredFor(report) && (!report.startDate || !report.stopDate)) {
                var msg = [];
                if (!report.startDate) {
                    msg.push("start date");
                }
                if (!report.stopDate) {
                    msg.push("end date");
                }
                messagingService.showMessage("formError", "Please select the " + msg.join(" and "))
            } else {
                reportService.generateReport(report);
                if (report.responseType == 'application/vnd.ms-excel-custom') {
                    report.reportTemplateLocation = undefined;
                    report.responseType = _.values($scope.formats)[0];
                }
            }
        };

        var initializeFormats = function(){
            var availableFormats = {
                "CSV": "text/csv",
                "HTML": "text/html",
                "EXCEL": "application/vnd.ms-excel",
                "PDF": "application/pdf",
                "CUSTOM EXCEL": "application/vnd.ms-excel-custom"
            };
            var supportedFormats = appService.getAppDescriptor().getConfigValue("supportedFormats") || _.keys(availableFormats);
            supportedFormats = _.map(supportedFormats, function(format){
                return format.toUpperCase();
            });
            $scope.formats = _.pick(availableFormats, supportedFormats);
        };

        var initialization = function () {
            var reportList = appService.getAppDescriptor().getConfigForPage("reports");
            $scope.reportsRequiringDateRange = _.values(reportList).filter(function (report) {
                return !(report.config && report.config.dateRangeRequired === false);
            });
            $scope.reportsNotRequiringDateRange = _.values(reportList).filter(function (report) {
                return (report.config && report.config.dateRangeRequired === false);
            });
            $scope.reportsDefined = _.values(reportList).length > 0;

            initializeFormats();
        };

        initialization();
    }]);
