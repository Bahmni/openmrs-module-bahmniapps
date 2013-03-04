angular.module('resources.patient', []);

angular.module('resources.patient').factory('patient', ['$http', '$rootScope', function ($http, $rootScope) {
    var search = function (query) {
        delete $http.defaults.headers.common['X-Requested-With'];
        return $http.get($rootScope.BaseUrl + "/openmrs/ws/rest/v1/patient?q=" + query + "&v=full",
            {method: "GET",
                withCredentials: true
            });
    }
    return {
        search: search
    };
}]);