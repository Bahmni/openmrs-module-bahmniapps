'use strict';

angular.module('bahmni.adt').factory('patientInitialization', ['$rootScope', '$q', 'patientService', 'initialization', 'bedService', 'spinner', '$translate',
    function ($rootScope, $q, patientService, initialization, bedService, spinner, $translate) {
        return function (patientUuid) {
            var getPatient = function () {
                var patientMapper = new Bahmni.PatientMapper($rootScope.patientConfig, $rootScope, $translate);
                var patientPromise = $q.defer();
                patientService.getPatient(patientUuid).then(function (response) {
                    $rootScope.patient = patientMapper.map(response.data);
                    patientPromise.resolve();
                });
                return patientPromise.promise;
            };

            var bedDetailsForPatient = function () {
                return bedService.setBedDetailsForPatientOnRootScope(patientUuid);
            };

            return spinner.forPromise(initialization.then(getPatient).then(bedDetailsForPatient));
        };
    }
]);

