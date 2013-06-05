'use strict';

angular.module('opd.diagnosisService', [])
    .factory('DiagnosisService', ['$http', function ($http) {

    var getAllFor = function (searchTerm, category) {
        var url = "/opd-service/concept";
        return $http.get(url, {
            method:"GET",
            params:{name:searchTerm, category:category, start:0, limit:25}
        });
    };

    return {
        getAllFor:getAllFor
    };
}]);