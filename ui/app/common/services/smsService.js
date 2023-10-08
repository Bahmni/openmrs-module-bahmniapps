'use strict';

angular.module('bahmni.common.util')
    .factory('smsService', ['$http', 'messagingService', function ($http, messagingService) {
        var sendSMS = function (phoneNumber, message) {
            getSMSUrl().then(function (smsEndpoint) {
                if (smsEndpoint.data != '') {
                    var data = {
                        "phoneNumber": phoneNumber,
                        "message": message
                    };
                    return $http.post(smsEndpoint.data, data, {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "text/plain"
                        }
                    });
                } else {
                    messagingService.showMessage("error", "SMS endpoint not configured for sending SMS notification");
                }
            });
        };

        var getSMSUrl = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'sms.endpoint'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            });
        };
        return {
            sendSMS: sendSMS
        };
    }]);
