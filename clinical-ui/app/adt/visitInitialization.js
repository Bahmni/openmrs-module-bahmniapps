'use strict';

angular.module('opd.adt').factory('visitInitialization',
    ['$rootScope', '$q', 'visitService', 'patientService', 'patientMapper', 'initialization',
        function ($rootScope, $q, visitService, patientService, patientMapper, initialization) {
            return function(patientUuid, visitUuid) {
                var getVisit = function() {
                    if(visitUuid != 'null') {
                        return visitService.getVisit(visitUuid).success(function (visit) {
                            $rootScope.visit = visit;
                        });
                    } else {
                        return $q.when({ id: 1, status: "Returned from service.", promiseComplete: true });
                    }
                };

                var getPatient = function() {
                    return patientService.getPatient(patientUuid).success(function (openMRSPatient) {
                        $rootScope.patient = patientMapper.map(openMRSPatient);
                    });
                };

                return initialization.then(function() { 
                    return $q.all([getVisit(), getPatient()])
                });
            }
        }]
);
