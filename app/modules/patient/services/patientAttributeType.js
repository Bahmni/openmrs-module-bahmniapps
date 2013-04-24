'use strict';

angular.module('resources.patientAttributeType', [])

    .factory('patientAttributeType', ['$http', '$rootScope', function ($http, $rootScope) {

        var patientAttributes = [];

        var init = function() {
            return $http.get($rootScope.BaseUrl + "/ws/rest/v1/personattributetype?v=full", {
                withCredentials: true
            }).success(function(data) {
                    patientAttributes = data.results;
                })
        };

        var patientAttributePromise = init();

        var getAll = function () {
            return patientAttributes;
        };

        var get  = function(attributeUuid){
            return patientAttributes.filter(function(value){return value.uuid === attributeUuid})[0];
        }

        return {
            getAll: getAll,
            get: get,
            initialization: patientAttributePromise
        };
    }]);