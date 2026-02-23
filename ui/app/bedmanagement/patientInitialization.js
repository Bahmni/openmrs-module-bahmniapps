/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.ipd').factory('patientInitialization', ['$rootScope', '$q', 'patientService', 'initialization', 'bedService', 'spinner', '$translate',
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

            return spinner.forPromise(initialization.then(getPatient));
        };
    }
]);

