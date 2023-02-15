 'use strict';

 angular.module('bahmni.common.util')
    .factory('transmissionService', ['$http', '$q', '$rootScope', 'locationService', '$bahmniCookieStore', '$translate', 'appService', 'visitService', '$filter', 'messagingService', function ($http, $q, $rootScope, locationService, $bahmniCookieStore, $translate, appService, visitService, $filter, messagingService) {
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
            var deferred = $q.defer();
            $http.post(Bahmni.Common.Constants.sendViaEmailUrl, params, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            }).then(function (response) {
                if (response.status != 200) {
                    messagingService.showMessage("error", "Unable to send email");
                } else {
                    messagingService.showMessage("info", "Mail sent successfully");
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        var getSharePrescriptionMailContent = function (recipientName, visit) {
            var message = $translate.instant(Bahmni.Clinical.Constants.sharePrescriptionMailContent);
            message = message.replace("#recipientName", recipientName);
            message = message.replaceAll("#locationName", $rootScope.locationName);
            message = message.replace("#locationAddress", $rootScope.locationAddress ? $rootScope.locationAddress : "");
            message = message.replace("#visitDate", $filter("bahmniDate")(visit.visitDate));
            return message;
        };

        return {
            sendEmail: sendEmail
        };
    }]);
