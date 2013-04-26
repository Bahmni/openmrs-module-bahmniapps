'use strict';

angular.module('registration.sessionService', [])
    .service('sessionService', ['$rootScope', '$http', function ($rootScope, $http) {
        var sessionResourcePath = $rootScope.openmrsUrl + '/ws/rest/v1/session';

        var get = function(){
            return $http.get(sessionResourcePath, { cache: false });
        }

        var create = function(username, password){
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa(username + ':' + password)},
                cache: false
            });
        }

        var destroy = function(){
            return $http.delete(sessionResourcePath);
        }

        return {
            get: get,
            create: create,
            destroy: destroy
        }
    }]);
