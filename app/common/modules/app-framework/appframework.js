'use strict';

angular.module('appFramework', ['authentication'])
    .service('appService', ['$rootScope', '$http', '$q', 'sessionService', function ($rootScope, $http, $q, sessionService) {
        var appExtensions = [];
        var userRoles = [];
        var loadAppExtensions = function(appName) {
            //TODO: introduce constant
            var deferrable = $q.defer();
            var appExtnUrl = "/bahmni_config/openmrs/apps/" + appName + "/extension.json";
            $http.get(appExtnUrl, {withCredentials: true}).success(function(data){
                appExtensions = data;
                deferrable.resolve(data);
            }).error(function(){
                deferrable.reject('Could not get app extensions for ' + appName);
            });
            return deferrable.promise;
        };

        this.initialize = function(appName) {
            var deferrable = $q.defer();
            var promises = [];
            promises.push(sessionService.loadCredentials());
            promises.push(loadAppExtensions(appName));
            $q.all(promises).then(function(results) {
                deferrable.resolve();
            });
            return deferrable.promise;
        };

        this.allowedApps = function(extnId) {
            if ($rootScope.currentUser && appExtensions) {
                var activePriviledges = $rootScope.currentUser.privileges.map(function(priv) {
                    return priv.retired ? "" : priv.name;
                });
                var appsExtns = $rootScope.appExtensions.filter(function(extn) {
                    //TODO: match against the extnId
                    return (activePriviledges.indexOf(extn.requiredPrivilege) >= 0);
                });
                return appsExtns;
            }
        };
    }]);