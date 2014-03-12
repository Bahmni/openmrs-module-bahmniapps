'use strict';

angular.module('bahmnihome')
    .service('sessionService', ['$rootScope', '$http', '$q', '$cookieStore', function ($rootScope, $http, $q, $cookieStore) {
        var sessionResourcePath = constants.openmrsUrl + '/ws/rest/v1/session';

        this.getSession = function(){
            return $http.get(sessionResourcePath, { cache: false });
        };

        var createSession = function(username, password){
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa(username + ':' + password)},
                cache: false
            });
        };

        this.loadCredentials = function() {
            var deferrable = $q.defer();
            if ($rootScope.currentUser) {
                deferrable.resolve($rootScope.currentUser);
            } else {
                var currentUser = $cookieStore.get('bahmni.user');
                $http.get("/openmrs/ws/rest/v1/user", {
                    method:"GET",
                    params: {
                        username: currentUser,
                        v: "custom:(username,privileges:(name,retired))"
                    },
                    cache: false
                }).success(function(data) {
                    $rootScope.currentUser = data.results[0];
                    deferrable.resolve(data.results[0]);
                }).error(function(){
                    deferrable.reject('Could not get credentials for the user.');
                });
            }
            return deferrable.promise;
        };
        

        this.destroy = function(){
            return $http.delete(sessionResourcePath).success(function(data){
                $rootScope.currentUser = null;
            });
        };

        this.loginUser = function(username, password) {
            var deferrable = $q.defer();
            createSession(username,password).success(function(data) {
                if (data.authenticated) {
                    $cookieStore.put('bahmni.user', username, {path: '/', expires: 7});
                    deferrable.resolve();
                } else {
                   deferrable.reject('Authentication failed. Please try again.');   
                }
            }).error(function(){
                deferrable.reject('Authentication failed. Please try again.');   
            });
            return deferrable.promise;
        };
    }]).directive('logOut',['sessionService', '$window', function(sessionService, $window) {
        return {
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.$apply(function() {
                        sessionService.destroy().then(
                            function () {
                                $window.location = "/home/#/login";
                            }
                        );
                    });
                });
            }
        };
    }]);
