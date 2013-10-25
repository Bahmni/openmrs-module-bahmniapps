'use strict';

angular.module('bahmnihome')
    .factory('initialization', ['$rootScope', '$q', 'configurationService', 'login', 'spinner',
        function ($rootScope, $q, configurationService, login, spinner) {
            var initializationPromiseDefer = $q.defer();

            var loadData = function () {
                var configurationPromise = configurationService.getAll().success(function (data) {
                    $rootScope.bahmniConfiguration = data;
                });

                return $q.all([configurationPromise]);
            };

            login.then(function () {
                var loadDataPromise = loadData();
                spinner.forPromise(loadDataPromise);
                loadDataPromise.then(function () {
                    initializationPromiseDefer.resolve();
                });
            });
            return initializationPromiseDefer.promise;
        }]);