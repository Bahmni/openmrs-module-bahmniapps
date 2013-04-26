'use strict';

angular.module('registration.initialization', ['resources.patientAttributeType', 'infrastructure'])
    .factory('initialization', ['$rootScope', '$q','configurationService', 'patientAttributeType', function($rootScope, $q, configurationService, patientAttributeType){
        $rootScope.openmrsUrl = constants.openmrsUrl;
        var patientAttributeTypePromise = patientAttributeType.init();
        var configurationPromise = configurationService.getAll().success(function (data) {
            $rootScope.bahmniConfiguration = data;
        });
        return $q.all([patientAttributeTypePromise, configurationPromise]);
    }]);