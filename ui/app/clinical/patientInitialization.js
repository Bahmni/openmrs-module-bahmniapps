'use strict';

angular.module('bahmni.clinical').factory('patientInitialization',
    ['$q', '$rootScope', 'patientService', 'configurations',
        function ($q, $rootScope, patientService, configurations) {

            return function (patientUuid) {
                var getPatient = function () {
                    var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope);
                    return patientService.getPatient(patientUuid).then(function (openMRSPatientResponse) {
                        var patient = patientMapper.map(openMRSPatientResponse.data);
                        return {"patient": patient};
                    })
                };

                return getPatient();
            }
        }]
);
