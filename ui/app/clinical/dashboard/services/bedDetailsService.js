'use strict';

angular.module('bahmni.clinical')
    .service('bedDetailsService', ['$http', function ($http) {

        var constructBedDetails = function (data) {
            if (data.data.results.length > 0) {
                var bed = data.data.results[0];
                return {
                    'wardName': bed.physicalLocation.parentLocation.display,
                    'bedNumber': bed.bedNumber
                };
            }
        };

        this.getBedDetailsByVisit = function (visitUuid) {
            var url = Bahmni.Common.Constants.bedFromVisit;
            return $http.get(url, {
                params: {
                    "s": "bedDetailsFromVisit",
                    "visitUuid": visitUuid
                }
            }).then(function (data) {
                return constructBedDetails(data)
            });
        };

    }]);