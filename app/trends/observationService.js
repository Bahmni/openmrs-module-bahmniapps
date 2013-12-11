angular.module("trends").service("observationService", ["$http", function ($http) {
    var url = "/openmrs/ws/rest/v1/bahmnicore/bahmniobs";

    var fetch = function (patientUiud) {
        return $http.get(url, {
            "params": {
                "patientUUID": patientUiud
            }
        });
    };

    return {
        fetch: fetch
    };
}]);
