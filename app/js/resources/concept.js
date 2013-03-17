'use strict';

angular.module('resources.concept', [])
    .factory('concept', ['$http', '$rootScope', function ($http, $rootScope) {

    var getRegistrationConcepts = function () {
        return $http.get($rootScope.BaseUrl + "/ws/rest/v1/concept?q=REGISTRATION_CONCEPTS&v=full",
            {
                method: "GET",
                withCredentials: true
            });
    }

    return {
        getRegistrationConcepts : getRegistrationConcepts
    };

}]);