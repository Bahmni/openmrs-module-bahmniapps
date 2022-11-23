'use strict';

angular.module('bahmni.common.util')
    .factory('smsService', ['$http', function ($http) {
        var otpServiceUrl = Bahmni.Common.Constants.otpServiceUrl;
        var smsAlert = function (phoneNumber, message) {
            const url = otpServiceUrl + "/notification/sms";
            return $http({
                url: url,
                method: 'POST',
                params: {
                    phoneNumber: phoneNumber,
                    message: message
                },
                withCredentials: true
            });
        };
        return {
            smsAlert: smsAlert
        };
    }]);
