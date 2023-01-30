'use strict';

angular.module('bahmni.clinical')
    .factory('transmissionService', ['$http', function ($http) {
        var otpServiceUrl = Bahmni.Common.Constants.otpServiceUrl;
        var sendSMS = function (phoneNumber, message) {
            const url = otpServiceUrl + "/notification/sms";
            var data = {
                "phoneNumber": phoneNumber,
                "message": message
            };
            return $http.post(url, data, {
                withCredentials: true,
                headers: {"Content-Type": "application/json"}
            });
        };
        return {
            sendSMS: sendSMS
        };
    }]);
