'use strict';

angular.module('registration.patient.models')
    .factory('errorCode', [function () {
        var openERPErrorCode = 3;

        var isOpenERPError = function(responseData) {
            return responseData && responseData.error && responseData.error.code === openERPErrorCode;
        }

        return {
            isOpenERPError: isOpenERPError
        }
}]);
