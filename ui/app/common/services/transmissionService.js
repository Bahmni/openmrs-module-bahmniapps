/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


 'use strict';

 angular.module('bahmni.common.util')
    .factory('transmissionService', ['$http', '$q', '$rootScope', 'locationService', '$bahmniCookieStore', '$translate', 'appService', 'visitService', '$filter', 'messagingService', function ($http, $q, $rootScope, locationService, $bahmniCookieStore, $translate, appService, visitService, $filter, messagingService) {
        var sendEmail = function (attachments, subject, body, emailUrl, cc, bcc) {
            var params = {
                "mailAttachments": attachments,
                "subject": subject,
                "body": body,
                "cc": cc,
                "bcc": bcc
            };
            var deferred = $q.defer();

            $http.post(emailUrl, params, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            }).then(function (response) {
                if (response.data.statusLine.statusCode != 200) {
                    messagingService.showMessage("error", response.data.statusLine.reasonPhrase);
                } else {
                    messagingService.showMessage("info", response.data.statusLine.reasonPhrase);
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        var getSharePrescriptionMailContent = function (prescriptionDetails) {
            var message = $translate.instant(Bahmni.Clinical.Constants.sharePrescriptionMailContent);
            message = message.replace("#recipientName", prescriptionDetails.patient.name);
            message = message.replaceAll("#locationName", $rootScope.facilityLocation.name);
            message = message.replace("#locationAddress", $rootScope.facilityLocation.attributes[0] ? $rootScope.facilityLocation.attributes[0].display.split(":")[1].trim() : "");
            message = message.replace("#visitDate", $filter("bahmniDate")(prescriptionDetails.visitDate));
            return message;
        };

        return {
            sendEmail: sendEmail,
            getSharePrescriptionMailContent: getSharePrescriptionMailContent
        };
    }]);
