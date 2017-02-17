'use strict';

angular.module('bahmni.ipd')
    .service('bedTagMapService', ['$http', function ($http) {
        this.getAllBedTags = function () {
            return $http.get(Bahmni.ADT.Constants.getAllBedTags, {
                params: {},
                withCredentials: true
            });
        };

        this.assignTagToABed = function (bedTagId, bedId) {
            var requestPayload = {
                "bedTag": {"id": bedTagId},
                "bed": {"id": bedId}
            };
            var headers = {"Content-Type": "application/json", "Accept": "application/json"};
            return $http.post(Bahmni.ADT.Constants.bedTagMapUrl, requestPayload, headers);
        };

        this.unAssignTagFromTheBed = function (bedTagMapUuid) {
            return $http.delete(Bahmni.ADT.Constants.bedTagMapUrl + bedTagMapUuid);
        };
    }]);
