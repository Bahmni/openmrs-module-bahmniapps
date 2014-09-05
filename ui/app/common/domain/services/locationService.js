'use strict';

angular.module('bahmni.common.domain')
    .factory('locationService', ['$http', function ($http) {
        var getAllByTag = function (tags) {
            return $http.get(Bahmni.Common.Constants.locationUrl, {
                params: {s: "byTags", q: tags || ""},
                cache: true
            });
        };

        return {
            getAllByTag: getAllByTag,
        };

    }]);
