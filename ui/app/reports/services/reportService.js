'use strict';

angular.module('bahmni.reports')
    .service('reportService', ['appService', '$bahmniCookieStore', '$http', function (appService, $bahmniCookieStore, $http) {
        var paperSize = appService.getAppDescriptor().getConfigValue("paperSize");
        var appName = appService.getAppName() ? appService.getAppName() : "reports" ;
        var generateReport = function (report) {
            var url = Bahmni.Common.Constants.reportsUrl+"/report";
            url = (url + "?name={0}&startDate={1}&endDate={2}&responseType={3}&paperSize={4}&appName={5}").
                    format(report.name, report.startDate, report.stopDate, report.responseType, paperSize, appName);
            if(report.reportTemplateLocation && report.responseType=='application/vnd.ms-excel-custom'){
                url = (url+"&macroTemplateLocation="+report.reportTemplateLocation);
            }
            window.open(url);
       };

        var scheduleReport = function (report) {
            var url = Bahmni.Common.Constants.reportsUrl + "/schedule";
            url = (url + "?name={0}&startDate={1}&endDate={2}&responseType={3}&paperSize={4}&appName={5}&userName={6}").format(report.name, report.startDate, report.stopDate, report.responseType, paperSize, appName, $bahmniCookieStore.get(Bahmni.Common.Constants.currentUser));
            if (report.reportTemplateLocation && report.responseType == 'application/vnd.ms-excel-custom') {
                url = (url + "&macroTemplateLocation=" + report.reportTemplateLocation);
            }
            return $http.get(url);
        };

        return {
            generateReport: generateReport,
            scheduleReport: scheduleReport
        };
    }]);
