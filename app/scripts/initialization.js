'use strict';

angular.module('bahmnihome')
    .factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'sessionService', 
        function ($rootScope, $q, appService, spinner, sessionService) {
            var deferrable = $q.defer();
            var promises = [];
            promises.push(sessionService.loadCredentials());
            promises.push(appService.loadAppExtensions('home'));
            $q.all(promises).then(function() {
                deferrable.resolve();
            });
            return deferrable.promise;
        }]);