'use strict';

angular.module('bahmni.adt').factory('patientInitialization', ['$rootScope', '$q', 'patientService', 'patientMapper', 'initialization', 'bedService',
    function($rootScope, $q, patientService, patientMapper, initialization, bedService) {
        return function(patientUuid) {
            var getPatient = function() {
                return patientService.getPatient(patientUuid).success(function(openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };
            
            var bedDetailsForPatient = function() {
                return bedService.getBedDetailsForPatient(patientUuid);
            };
            
            return initialization.then(function(){
                $q.all([getPatient(), bedDetailsForPatient()]);
            });
        }
    }
]);