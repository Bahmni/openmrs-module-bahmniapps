'use strict';

angular.module('registration.initialization', ['resources.patientAttributeType', 'infrastructure', 'registration.login', 'infrastructure.spinner'])
    .factory('initialization', ['$rootScope', '$q','configurationService', 'patientAttributeType', 'login', 'spinner', function($rootScope, $q, configurationService, patientAttributeType, login, spinner){
        var initializationPromiseDefer = $q.defer();

        var loadData = function() {
            var patientAttributeTypePromise = patientAttributeType.init();
            var configurationPromise = configurationService.getAll().success(function (data) {
                $rootScope.bahmniConfiguration = data;
            });
            return $q.all([patientAttributeTypePromise, configurationPromise]);
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