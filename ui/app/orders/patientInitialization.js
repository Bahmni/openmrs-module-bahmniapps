'use strict';

angular.module('bahmni.orders').factory('patientInitialization',
    ['$q', '$rootScope', 'patientService', 'configurations', '$translate',
        function ($q, $rootScope, patientService, configurations, $translate) {
            return function (patientUuid) {
                var getPatient = function () {
                    var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope, $translate);
                    return patientService.getPatient(patientUuid).then(function (openMRSPatientResponse) {
                        var patient = patientMapper.map(openMRSPatientResponse.data);
                        return {"patient": patient};
                    });
                };

                return getPatient();
            };
        }]
);
