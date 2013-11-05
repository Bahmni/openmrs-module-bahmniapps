'use strict';

angular.module('infrastructure')
    .service('appService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {

     	this.loadAppExtensions = function(appName) {
            //introduce constant
            var deferrable = $q.defer();
            var appExtnUrl = "/bahmni_config/openmrs/apps/" + appName + "/extension.json";
            $http.get(appExtnUrl, {withCredentials: true}).success(function(data){
            	$rootScope.appExtensions = data;
            	deferrable.resolve(data);
            }).error(function(){
            	deferrable.reject('Could not get app extensions for ' + appName);
            });
            return deferrable.promise;
        };

        this.allowedApps = function() {
            if ($rootScope.currentUser && $rootScope.appExtensions) {
                var activePriviledges = $rootScope.currentUser.privileges.map(function(priv) {
                    return priv.retired ? "" : priv.name;
                });
                var appsExtns = $rootScope.appExtensions.filter(function(extn) {
                    return (activePriviledges.indexOf(extn.requiredPrivilege) >= 0);
                });
                return appsExtns;
            }
        };

    }]);