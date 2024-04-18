'use strict';

angular.module('bahmni.reports')
    .service('reportService', ['appService', '$bahmniCookieStore', '$http', function (appService, $bahmniCookieStore, $http) {
        var paperSize = appService.getAppDescriptor().getConfigValue("paperSize");
        var appName = appService.getAppName() ? appService.getAppName() : "reports";
        var currentDate = new Date();
        var availableFormats = {
            "CSV": "text/csv",
            "HTML": "text/html",
            "EXCEL": "application/vnd.ms-excel",
            "PDF": "application/pdf",
            "CUSTOM EXCEL": "application/vnd.ms-excel-custom",
            "ODS": "application/vnd.oasis.opendocument.spreadsheet"
        };
        var avaialbleDateRange = {
            "Today": currentDate,
            "This Month": new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            "Previous Month": new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
            "This Quarter": new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1),
            "This Year": new Date(currentDate.getFullYear(), 0, 1),
            "Last 7 days": new Date(new Date().setDate(currentDate.getDate() - 7)),
            "Last 30 days": new Date(new Date().setDate(currentDate.getDate() - 30))
        };

        var scheduleReport = function (report) {
            var url = Bahmni.Common.Constants.reportsUrl + "/schedule";
            url = (url + "?name={0}&startDate={1}&endDate={2}&responseType={3}&paperSize={4}&appName={5}&userName={6}").format(report.name, report.startDate, report.stopDate, report.responseType, paperSize, appName, currentUser());
            if (report.reportTemplateLocation && report.responseType == 'application/vnd.ms-excel-custom') {
                url = (url + "&macroTemplateLocation=" + report.reportTemplateLocation);
            }
            return $http.get(url);
        };

        var currentUser = function () {
            return $bahmniCookieStore.get(Bahmni.Common.Constants.currentUser);
        };

        var getScheduledReports = function () {
            var url = Bahmni.Common.Constants.reportsUrl + "/getReports?user={0}";
            url = url.format(currentUser());
            return $http.get(url);
        };
        var getAvailableFormats = function () {
            return availableFormats;
        };
        var getMimeTypeForFormat = function (format) {
            return availableFormats[format];
        };
        var getFormatForMimeType = function (mimeType) {
            return _.findKey(availableFormats, function (value) {
                if (value === mimeType) {
                    return true;
                }
            });
        };
        var getAvailableDateRange = function () {
            return avaialbleDateRange;
        };
        var deleteReport = function (id) {
            var url = Bahmni.Common.Constants.reportsUrl + "/delete/{0}";
            url = url.format(id);
            return $http.get(url);
        };

        var generateReport = function (report) {
            var url = Bahmni.Common.Constants.reportsUrl + "/report";
            url = (url + "?name={0}&startDate={1}&endDate={2}&responseType={3}&paperSize={4}&appName={5}").format(report.name, report.startDate, report.stopDate, report.responseType, paperSize, appName);
            if (report.reportTemplateLocation && report.responseType == 'application/vnd.ms-excel-custom') {
                url = (url + "&macroTemplateLocation=" + report.reportTemplateLocation);
            }
            window.open(url);
        };

        return {
            getFormatForMimeType: getFormatForMimeType,
            getMimeTypeForFormat: getMimeTypeForFormat,
            getAvailableFormats: getAvailableFormats,
            getAvailableDateRange: getAvailableDateRange,
            scheduleReport: scheduleReport,
            getScheduledReports: getScheduledReports,
            deleteReport: deleteReport,
            generateReport: generateReport
        };
    }]);
