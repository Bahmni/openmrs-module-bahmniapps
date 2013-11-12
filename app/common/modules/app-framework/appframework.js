'use strict';

angular.module('appFramework', ['authentication'])
    .service('appService', ['$http', '$q', 'sessionService','$rootScope', function ($http, $q, sessionService, $rootScope) {
        var appExtensions = null;
        var currentUser = null;
        var loadAppExtensions = function (appName) {
            //TODO: introduce constant
            var deferrable = $q.defer();
            var appExtnUrl = "/bahmni_config/openmrs/apps/" + appName + "/extension.json";
            $http.get(appExtnUrl, {withCredentials: true}).success(function (data) {
                deferrable.resolve(data);
            }).error(function () {
                    deferrable.reject('Could not get app extensions for ' + appName);
                });
            return deferrable.promise;
        };

        this.initialize = function (appName) {
            var deferrable = $q.defer();
            var promises = [];
            promises.push(sessionService.loadCredentials());
            promises.push(loadAppExtensions(appName));
            $q.all(promises).then(function (results) {
                currentUser = results[0];
                appExtensions = results[1];
                deferrable.resolve();
                $rootScope.$broadcast('event:appExtensions-loaded');
            });
            return deferrable.promise;
        };

        this.allowedAppExtensions = function (extnId, type) {
            if (currentUser && appExtensions) {
                var extnType = type || "link";
                var userPrivileges = currentUser.privileges.map(function (priv) {
                    return priv.retired ? "" : priv.name;
                });
                var appsExtns = appExtensions.filter(function (extn) {
                    return (extn.type===extnType) && (extn.extensionPointId === extnId) && (!extn.requiredPrivilege || (userPrivileges.indexOf(extn.requiredPrivilege) >= 0));
                });
                appsExtns.sort(function(extn1, extn2) {
                    return extn1.order - extn2.order;
                });
                return appsExtns;
            }
        };
    }]);