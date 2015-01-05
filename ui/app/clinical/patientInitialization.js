'use strict';

angular.module('bahmni.clinical').factory('patientInitialization',
    ['$rootScope', '$q', 'patientService', 'spinner', 'initialization', 'configurations',
        function ($rootScope, $q, patientService, spinner, initialization, configurations) {

            var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig());

            return function (patientUuid) {
                var getPatient = function () {
                    return patientService.getPatient(patientUuid).then(function (openMRSPatientResponse) {
                        $rootScope.patient = patientMapper.map(openMRSPatientResponse.data);
                    })
                };

                return spinner.forPromise(
                    initialization.then(function () {
                        return $q.all([getPatient()]);
                    })
                );
            }
        }]
);
