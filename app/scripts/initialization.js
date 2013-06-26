'use strict';

angular.module('registration.initialization', ['resources.patientAttributeType', 'infrastructure', 'registration.login', 'infrastructure.spinner'])
    .factory('initialization', ['$rootScope', '$q','configurationService', 'patientAttributeType', 'login', 'spinner',
    function($rootScope, $q, configurationService, patientAttributeType, login, spinner){
        var initializationPromiseDefer = $q.defer();

        var loadData = function() {
            var patientAttributeTypePromise = patientAttributeType.init();
            var configurationPromise = configurationService.getAll().success(function (data) {
                $rootScope.bahmniConfiguration = data;
            });

            var encounterConfigPromise = configurationService.getEncounterConfig().success(function (data) {
                $rootScope.encounterConfiguration = angular.extend(new EncounterConfig(), data);
            });
            return $q.all([patientAttributeTypePromise, configurationPromise, encounterConfigPromise]);
        }

        login.then(function () {
            var loadDataPromise = loadData();
            spinner.forPromise(loadDataPromise);
            loadDataPromise.then(function(){
                initializationPromiseDefer.resolve();
            });
        });
        return initializationPromiseDefer.promise;
    }]);