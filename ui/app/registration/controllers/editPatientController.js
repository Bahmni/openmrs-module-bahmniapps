'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper', '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope',
        function ($scope, patientService, encounterService, $stateParams, patientMapper, $window, $q, spinner, appService, messagingService, $rootScope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};
            $scope.readOnlyFields = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());

            var setReadOnlyFields = function () {
                var readOnlyFields = appService.getAppDescriptor().getConfigValue("readOnlyFields");
                angular.forEach(readOnlyFields, function (readOnlyField) {
                    if ($scope.patient[readOnlyField]) {
                        $scope.readOnlyFields[readOnlyField] = true;

                    }
                });
            };

            var showOrHideAdditionalPatientInformation = function () {
                var additionalPatientInfoConfig = appService.getAppDescriptor().getConfigValue("additionalPatientInformation");
                angular.forEach(additionalPatientInfoConfig, function (attribute) {
                    if ($scope.patient[attribute.name]) {
                        $scope.displayAdditionalInformation = true;
                    }
                });
            };

            var successCallBack = function(openmrsPatient){
                $scope.openMRSPatient = openmrsPatient["patient"];
                $scope.patient = patientMapper.map(openmrsPatient);
                setReadOnlyFields();
                showOrHideAdditionalPatientInformation();
            };


            (function () {
                var getPatientPromise = patientService.get(uuid).success(successCallBack);

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.success(function (data) {
                    var encountersWithObservations = data.results.filter(function (encounter) {
                        return encounter.obs.length > 0
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized]));
            })();

            $scope.update = function () {
                addNewRelationships();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.personAttributeTypes);
                if (errMsg) {
                    messagingService.showMessage('formError', errMsg);
                    return;
                }

                var patientUpdatePromise = patientService.update($scope.patient, $scope.openMRSPatient).success(function (patientProfileData) {
                    successCallBack(patientProfileData);
                    $scope.actions.followUpAction(patientProfileData);
                });
                spinner.forPromise(patientUpdatePromise);
            };

            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function(relationship){
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = $scope.patient.relationships.concat(newRelationships);
            };

            $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields[field];
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "Saved");
            }

        }]);