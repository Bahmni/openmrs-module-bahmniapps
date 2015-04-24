'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', 'patientService', 'Preferences', 'patient', 'spinner', 'appService',
    function ($scope, $rootScope, patientService, preferences, patientModel, spinner, appService) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        $scope.actions = {};
        var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
        $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;

        (function () {
            $scope.patient = patientModel.create();
            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            var identifierPrefix = $scope.identifierSources.filter(function (identifierSource) {
                return identifierSource.prefix === preferences.identifierPrefix;
            });
            $scope.patient.identifierPrefix = identifierPrefix[0] || $scope.identifierSources[0];
            $scope.hasOldIdentifier = preferences.hasOldIdentifier;
        })();

        $scope.create = function () {
            setPreferences();
            if (!$scope.patient.identifier) {
                spinner.forPromise(patientService.generateIdentifier($scope.patient).then(function (response) {
                    $scope.patient.identifier = response.data;
                    return patientService.create($scope.patient).success(successCallback).success($scope.actions.followUpAction);
                }));
            } else {
                spinner.forPromise(patientService.create($scope.patient).success(successCallback).success($scope.actions.followUpAction));
            }
        };

        var setPreferences = function () {
            preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
            preferences.hasOldIdentifier = $scope.hasOldIdentifier;
        };

        var successCallback = function (patientProfileData) {
            $scope.patient.uuid = patientProfileData.patient.uuid;
            $scope.patient.identifier = patientProfileData.patient.identifiers[0].identifier;
            $scope.patient.name = patientProfileData.patient.person.names[0].display;
            $scope.patient.isNew = true;
            $scope.patient.registrationDate = dateUtil.now();
        };

    }]);
