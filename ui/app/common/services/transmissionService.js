 'use strict';

 angular.module('bahmni.common.util')
    .factory('transmissionService', ['$http', '$rootScope', 'locationService', '$bahmniCookieStore', '$translate', 'appService', 'visitService', '$filter', function ($http, $rootScope, locationService, $bahmniCookieStore, $translate, appService, visitService, $filter) {
        var sendEmail = function (pdfContent, recipient, visit) {
            var subject = "Sending Prescriptions";
            var body = getSharePrescriptionMailContent(recipient.name, visit);
            var recipient = {"name": recipient.name, "email": recipient.email};
            var params = {
                "pdf": pdfContent,
                "recipient": recipient,
                "subject": subject,
                "body": body,
                "cc": [],
                "bcc": []
            };
            return $http.post(Bahmni.Common.Constants.sendViaEmailUrl, params, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var getSharePrescriptionMailContent = function (recipientName, visit) {
            var message = $translate.instant(Bahmni.Clinical.Constants.sharePrescriptionMailContent);
            message = message.replace("#recipientName", recipientName);
            message = message.replaceAll("#locationName", $rootScope.locationName);
            message = message.replace("#locationAddress", $rootScope.locationAddress);
            message = message.replace("#visitDate", $filter("bahmniDate")(visit.visitDate));
            return message;
        };

        return {
            sendEmail: sendEmail
        };
    }]);
