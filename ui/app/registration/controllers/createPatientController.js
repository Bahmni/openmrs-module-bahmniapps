'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'Preferences', 'patient', 'spinner', 'appService', 'messagingService',
        function ($scope, $rootScope, $state, patientService, preferences, patientModel, spinner, appService, messagingService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
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

            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function(relationship){
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete re.providerName;
                });
                $scope.patient.relationships = $scope.patient.relationships.concat(newRelationships);

            };

            $scope.create = function () {
                setPreferences();
                addNewRelationships();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.personAttributeTypes);
                if (errMsg) {
                    messagingService.showMessage('formError', errMsg);
                    return;
                }

                if (!$scope.hasOldIdentifier) {
                    spinner.forPromise(patientService.generateIdentifier($scope.patient)
                        .then(function (response) {
                            $scope.patient.identifier = response.data;
                            patientService.create($scope.patient).success(successCallback);
                        }));
                }
                else {
                    patientService.create($scope.patient).success(successCallback);
                }
            };

            var setPreferences = function () {
                preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
            };

            var successCallback = function (patientProfileData) {
                $scope.patient.uuid = patientProfileData.patient.uuid;
                $scope.patient.name = patientProfileData.patient.person.names[0].display;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate = dateUtil.now();
                $scope.actions.followUpAction(patientProfileData);
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "Saved");
                $state.go("patient.edit", {patientUuid: $scope.patient.uuid});
            };

        }]);
