'use strict';

angular.module('resources.concept', [])
    .factory('concept', ['$http', '$rootScope', function ($http, $rootScope) {

    var getRegistrationConcepts = function () {
        var query="REGISTRATION_CONCEPTS";
        return $http.get($rootScope.openmrsUrl + "/ws/rest/v1/concept",
            {
                method: "GET",
                params: {q: query, v: "custom:(setMembers:(uuid,name:(name)))"},
                withCredentials: true
            });
    }

    return {
        getRegistrationConcepts : getRegistrationConcepts
    };

}]);