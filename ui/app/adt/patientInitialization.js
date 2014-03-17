'use strict';

angular.module('bahmni.adt').factory('patientInitialization', ['$rootScope', '$q', 'patientService', 'patientMapper', 'initialization', 'bedService','spinner',
    function($rootScope, $q, patientService, patientMapper, initialization, bedService, spinner) {
        return function(patientUuid) {
            var getPatient = function() {
                return patientService.getPatient(patientUuid).success(function(openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };
            
            var bedDetailsForPatient = function() {
                return bedService.getBedDetailsForPatient(patientUuid);
            };
            
            return spinner.forPromise(initialization.then(function(){
                $q.all([getPatient(), bedDetailsForPatient()]);
            }));
        }
    }
]);