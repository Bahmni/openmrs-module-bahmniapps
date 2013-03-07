'use strict';

angular.module('registration', ['registration.search', 'registration.session'])
angular.module('registration').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/create', {templateUrl: 'partials/create.html', controller: 'CreateNewPatientController'});
        $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'SessionController'});
        $routeProvider.otherwise({redirectTo: '/login'});

        var interceptor = ['$rootScope', '$q', '$location', function (scope, $q, $location) {
            function success(response) {
                return response;
            }

            function error(response) {
                var status = response.status;
                if(status == 401)
                    scope.$broadcast("event:loginRequired");
                return $q.reject(response);
            }

            return function (promise) {
                return promise.then(success, error);
            }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }]).run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.BaseUrl = '/openmrs';

        $rootScope.$on('event:loginRequired', function() {
            $location.path("/login");
        })
    }]);
