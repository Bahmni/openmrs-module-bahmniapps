'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'Preferences', 'patient', 'spinner', 'appService', 'messagingService', 'ngDialog', '$q', 'offlineService',
        function($scope, $rootScope, $state, patientService, preferences, patientModel, spinner, appService, messagingService, ngDialog, $q, offlineService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;
            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());

            var getPersonAttributeTypes = function() {
                return $rootScope.patientConfiguration.attributeTypes;
            };

            var prepopulateDefaultsInFields = function() {

                var personAttributeTypes = getPersonAttributeTypes();
                var patientInformation = appService.getAppDescriptor().getConfigValue("patientInformation");
                if (!patientInformation || !patientInformation.defaults) {
                    return;
                }
                var defaults = patientInformation.defaults;
                var defaultVariableNames = _.keys(defaults);

                var hasDefaultAnswer = function(personAttributeType) {
                    return _.includes(defaultVariableNames, personAttributeType.name);
                };

                var isConcept = function(personAttributeType) {
                    return personAttributeType.format === "org.openmrs.Concept";
                };

                var setDefaultAnswer = function(personAttributeType) {
                    $scope.patient[personAttributeType.name] = defaults[personAttributeType.name];
                };

                var setDefaultConcept = function(personAttributeType) {
                    var defaultAnswer = defaults[personAttributeType.name];
                    var isDefaultAnswer = function(answer) {
                        return answer.fullySpecifiedName === defaultAnswer;
                    };

                    _.chain(personAttributeType.answers).filter(isDefaultAnswer).each(function(answer) {
                        $scope.patient[personAttributeType.name] = answer.conceptId;
                    }).value();
                };

                _.chain(personAttributeTypes)
                    .filter(hasDefaultAnswer)
                    .each(setDefaultAnswer).filter(isConcept).each(setDefaultConcept).value();
            };

            var getPatientAttributeSections = function(){
                return $rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections();
            };

            var buildSectionVisibilityMap = function() {
                $scope.sectionVisibilityMap = {};
                var patientAttributeSections = getPatientAttributeSections();
                var shouldShowSection = function(key) {
                    return _.some(patientAttributeSections[key].attributes, function(attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                };
                _.chain(patientAttributeSections)
                    .keys()
                    .filter(shouldShowSection)
                    .each(function(key) {
                        $scope.sectionVisibilityMap[key] = true;
                    }).value();
            };

            var init = function() {
                $scope.patient = patientModel.create();
                $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
                var identifierPrefix = _.find($scope.identifierSources, {
                    prefix: preferences.identifierPrefix
                });
                $scope.patient.identifierPrefix = identifierPrefix || $scope.identifierSources[0];
                $scope.patient.hasOldIdentifier = preferences.hasOldIdentifier;
                prepopulateDefaultsInFields();
                buildSectionVisibilityMap();

            };

            init();

            var prepopulateFields = function() {
                var fieldsToPopulate = appService.getAppDescriptor().getConfigValue("prepopulateFields");
                if (fieldsToPopulate) {
                    _.each(fieldsToPopulate, function(field) {
                        var addressLevel = _.find($scope.addressLevels, function(level) {
                            return level.name == field;
                        });
                        if (addressLevel) {
                            $scope.patient.address[addressLevel.addressField] = $rootScope.loggedInLocation[addressLevel.addressField];
                        }
                    });
                }
            };
            prepopulateFields();

            var addNewRelationships = function() {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function(relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function(relationship) {
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = $scope.patient.relationships.concat(newRelationships);
            };

            var getConfirmationViaNgDialog = function(config) {
                var ngDialogLocalScope = config.scope.$new();
                ngDialogLocalScope.yes = function() {
                    ngDialog.close();
                    config.yesCallback();
                };
                ngDialogLocalScope.no = function() {
                    ngDialog.close();
                };
                ngDialog.open({
                    template: config.template,
                    data: config.data,
                    scope: ngDialogLocalScope
                });
            };

            var setPreferences = function() {
                preferences.identifierPrefix = $scope.patient.identifierPrefix ? $scope.patient.identifierPrefix.prefix : "";
            };

            var copyPatientProfileDataToScope = function(response) {
                var patientProfileData = response.data;
                $scope.patient.uuid = patientProfileData.patient.uuid;
                $scope.patient.name = patientProfileData.patient.person.names[0].display;
                $scope.patient.isNew = true;
                $scope.patient.identifierPrefix = patientProfileData.patient.identifiers[0].identifierPrefix;
                $scope.patient.registrationDate = dateUtil.now();
                $scope.patient.newlyAddedRelationships = [{}];
                $scope.actions.followUpAction(patientProfileData);
            };


            var createPatient = function(jumpAccepted) {
                return patientService.create($scope.patient, jumpAccepted).then(function(response){
                    copyPatientProfileDataToScope(response);
                },function(response){
                    if(response.status == 412) {
                        getConfirmationViaNgDialog({
                            template: 'views/customIdentifierConfirmation.html',
                            data: {
                                sizeOfTheJump: response.data.sizeOfJump
                            },
                            scope: $scope,
                            yesCallback: function() {
                                return createPatient(true);
                            }
                        })
                    }

                })
            };

            var createPromise = function() {
                var deferred = $q.defer();
                var resolved = function () {
                    return deferred.resolve({});
                };

                setPreferences();
                addNewRelationships();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errMsg) {
                    messagingService.showMessage('error', errMsg);
                    deferred.reject();
                } else {
                    createPatient().finally(resolved);
                }
                return deferred.promise;
            };


            $scope.isOffline = function(){
                return offlineService.isOfflineApp();
            };

            $scope.create = function() {
                return spinner.forPromise(createPromise());
            };

            $scope.afterSave = function() {
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
                $state.go("patient.edit", {
                    patientUuid: $scope.patient.uuid
                });
            };

            $scope.hasIdentifierSources = function() {
                return $scope.identifierSources.length > 0;
            };

        }
    ]);
