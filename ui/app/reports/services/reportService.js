'use strict';

angular.module('bahmni.reports')
    .service('reportService', ['appService', function (appService) {
        var paperSize = appService.getAppDescriptor().getConfigValue("paperSize");
        var appName = appService.getAppName() ? appService.getAppName() : "reports" ;
        var generateReport = function (report) {
            var url = Bahmni.Common.Constants.reportsUrl;
            url = (url + "?name={0}&startDate={1}&endDate={2}&responseType={3}&paperSize={4}&appName={5}").
                    format(report.name, report.startDate, report.stopDate, report.responseType, paperSize, appName);
            if(report.reportTemplateLocation && report.responseType=='application/vnd.ms-excel-custom'){
                url = (url+"&macroTemplateLocation="+report.reportTemplateLocation);
            }
            window.open(url);
       };

        return {
            generateReport: generateReport
        };
    }]);
