'use strict';

angular.module('bahmnihome')
    .service('sessionService', ['$rootScope', '$http', '$q', '$cookieStore', function ($rootScope, $http, $q, $cookieStore) {
        var sessionResourcePath = constants.openmrsUrl + '/ws/rest/v1/session';

        var getSession = function(){
            return $http.get(sessionResourcePath, { cache: false });
        };

        var createSession = function(username, password){
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa(username + ':' + password)},
                cache: false
            });
        };

        var loadCredentials = function() {
            var deferrable = $q.defer();
            var currentUser = $cookieStore.get('bahmni.user');
            $http.get("/openmrs/ws/rest/v1/user", { 
                method:"GET",
                params: {
                    q: currentUser,
                    v: "custom:(username,privileges:(name,retired))"
                },
                cache: false
            }).success(function(data) {
                $rootScope.currentUser = data.results[0];
                deferrable.resolve(data.results[0]);
            }).error(function(){
                deferrable.reject('Could not get roles for the current user.');
            });
            return deferrable.promise;
        };
        

        var destroy = function(){
            return $http.delete(sessionResourcePath);
        };

        var loginUser = function(username, password) {
            var deferrable = $q.defer();
            createSession(username,password).success(function(data) {
                if (data.authenticated) {
                    $cookieStore.put('bahmni.user', username);
                    deferrable.resolve();
                } else {
                   deferrable.reject('Authentication failed. Please try again.');   
                }
            }).error(function(){
                deferrable.reject('Authentication failed. Please try again.');   
            });
            return deferrable.promise;
        };

        return {
            getSession: getSession,
            destroy: destroy,
            loginUser:loginUser,
            loadCredentials:loadCredentials
        };
    }]);
