'use strict';

angular.module('bahmni.admin')
.service('fhirExportService', ['$http', '$translate', 'messagingService', function ($http, $translate, messagingService) {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var convertToLocalDate = function (date) {
        var localDate = DateUtil.parseLongDateToServerFormat(date);
        return DateUtil.getDateTimeInSpecifiedFormat(localDate, 'MMMM Do, YYYY [at] h:mm:ss A');
    };

    this.getUuidForAnonymiseConcept = function () {
        const params = {
            name: 'FHIR Export Anonymise Flag',
            s: 'default',
            v: 'default'
        };
        return $http.get(Bahmni.Common.Constants.conceptUrl, {params: params});
    };

    this.loadFhirTasks = function () {
        const params = {
            "_sort:desc": "_lastUpdated",
            _count: 50
        };
        return $http.get(Bahmni.Common.Constants.fhirTasks, {params: params});
    };

    this.submitAudit = function (username, startDate, endDate, anonymise) {
        var eventType = "PATIENT_DATA_BULK_EXPORT";
        var exportMode = anonymise ? "Anonymized" : "Non-Anonymized";
        var message = "User " + username + " performed a bulk patient data export for: Start Date " + convertToLocalDate(startDate) + " and End Date " + convertToLocalDate(endDate) + "  in " + exportMode + " mode";
        var module = "Export";
        var auditData = {
            username: username,
            eventType: eventType,
            message: message,
            module: module
        };
        return $http.post(Bahmni.Common.Constants.auditLogUrl, auditData, {
            withCredentials: true
        });
    };

    this.export = function (username, startDate, endDate, anonymise) {
        var url = Bahmni.Common.Constants.fhirExportUrl + "?anonymise=" + anonymise;
        if (startDate) {
            url = url + "&startDate=" + startDate;
        }
        if (endDate) {
            url = url + "&endDate=" + endDate;
        }
        return $http.post(url, {
            withCredentials: true,
            headers: {"Accept": "application/json", "Content-Type": "application/json"}
        });
    };
}]);
