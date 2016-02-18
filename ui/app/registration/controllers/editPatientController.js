'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper', '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope',
        function ($scope, patientService, encounterService, $stateParams, patientMapper, $window, $q, spinner, appService, messagingService, $rootScope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");

            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());

            var setReadOnlyFields = function () {
                $scope.readOnlyFields = {};
                var readOnlyFields = appService.getAppDescriptor().getConfigValue("readOnlyFields");
                angular.forEach(readOnlyFields, function (readOnlyField) {
                    if ($scope.patient[readOnlyField]) {
                        $scope.readOnlyFields[readOnlyField] = true;
                    }
                });
            };

            var successCallBack = function(openmrsPatient){
                $scope.openMRSPatient = openmrsPatient["patient"];
                $scope.patient = patientMapper.map(openmrsPatient);
                setReadOnlyFields();
                buildSectionVisibilityMap();
            };

            var buildSectionVisibilityMap = function () {
                $scope.sectionVisibilityMap = {};
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function(section, key) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    $scope.sectionVisibilityMap[key] = notNullAttribute ? true : false;
                });
            };

            (function () {
                var getPatientPromise = patientService.get(uuid).then(successCallBack);

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.then(function (data) {
                    var encountersWithObservations = data.data.results.filter(function (encounter) {
                        return encounter.obs.length > 0
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized]));
            })();


            $scope.update = function () {
                addNewRelationships();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errMsg) {
                    messagingService.showMessage('formError', errMsg);
                    return;
                }

                var patientUpdatePromise = patientService.update($scope.patient, $scope.openMRSPatient).then(function (patientProfileData) {
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
                return $scope.readOnlyFields? ($scope.readOnlyFields[field]? true: false): undefined;
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
            }

        }]);