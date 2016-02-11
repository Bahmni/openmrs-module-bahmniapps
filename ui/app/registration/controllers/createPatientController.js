'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'Preferences', 'patient', 'spinner', 'appService', 'messagingService', 'ngDialog', '$q', '$bahmniCookieStore', 'locationService',
        function ($scope, $rootScope, $state, patientService, preferences, patientModel, spinner, appService, messagingService, ngDialog, $q, $bahmniCookieStore, locationService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;
            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());

            var prepopulateDefaultsInFields = function () {

                var personAttributeTypes = getPersonAttributeTypes();
                var defaults = {};
                var patientInformation = appService.getAppDescriptor().getConfigValue("patientInformation");
                if(!patientInformation || !patientInformation.defaults){
                    return
                }
                defaults = patientInformation.defaults;

                _.each(personAttributeTypes, function (personAttributeType) {
                    var present = _.contains(Object.keys(defaults), personAttributeType.name);
                    if (present) {
                        if(personAttributeType.format == "org.openmrs.Concept") {
                            var answers = personAttributeType.answers;
                            var defaultAnswer = _.findWhere(answers, {description: defaults[personAttributeType.name]})
                            if (defaultAnswer) {
                                $scope.patient[personAttributeType.name] = defaultAnswer.conceptId;
                            }
                        }else {
                            $scope.patient[personAttributeType.name] = defaults[personAttributeType.name];
                        }
                    }
                });
            };

            var getPersonAttributeTypes = function () {
                return $rootScope.patientConfiguration.attributeTypes;
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
                $scope.patient = patientModel.create();
                $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
                var identifierPrefix = _.findWhere($scope.identifierSources, {prefix: preferences.identifierPrefix});
                $scope.patient.identifierPrefix = identifierPrefix || $scope.identifierSources[0];
                $scope.hasOldIdentifier = preferences.hasOldIdentifier;
                prepopulateDefaultsInFields();
                buildSectionVisibilityMap();

            })();

            var prepopulateFields = function () {
                var fieldsToPopulate = appService.getAppDescriptor().getConfigValue("prepopulateFields");
                if (fieldsToPopulate) {
                    angular.forEach(fieldsToPopulate, function (field) {
                        var addressLevel = _.find($scope.addressLevels, function (level) {
                            return level.name == field
                        });
                        if (addressLevel) {
                            $scope.patient.address[addressLevel.addressField] = $rootScope.loggedInLocation[addressLevel.addressField];
                        }
                    });
                }
            };

            prepopulateFields();


            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function (relationship) {
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = $scope.patient.relationships.concat(newRelationships);
            };

            var getConfirmationViaNgDialog = function (config) {
                var ngDialogLocalScope = config.scope.$new();
                ngDialogLocalScope.yes = function () {
                    ngDialog.close();
                    config.yesCallback();
                };
                ngDialogLocalScope.no = function () {
                    ngDialog.close();
                };
                ngDialog.open({
                    template: config.template,
                    data: config.data,
                    scope: ngDialogLocalScope
                });
            };

            var createPatientAndSetIdentifier = function (sourceName, nextIdentifierToBe) {
                return patientService.setLatestIdentifier(sourceName, nextIdentifierToBe)
                .then(function (response) {
                    return patientService.create($scope.patient)
                })
                .then(copyPatientProfileDataToScope);
            };

            var createPatientWithGeneratedIdentifier = function() {
                return patientService.generateIdentifier($scope.patient)
                .then(function (response) {
                    $scope.patient.identifier = response.data;
                    return patientService.create($scope.patient)
                })
                .then(copyPatientProfileDataToScope);
            };

            var createPatientWithGivenIdentifier = function() {
                var sourceName = $scope.patient.identifierPrefix.prefix;
                var givenIdentifier = parseInt($scope.patient.registrationNumber);
                var nextIdentifierToBe = parseInt($scope.patient.registrationNumber) + 1;
                return patientService.getLatestIdentifier($scope.patient.identifierPrefix.prefix).then(function (response) {
                    var latestIdentifier = response.data;
                    var sizeOfTheJump = givenIdentifier - latestIdentifier;
                    if (sizeOfTheJump === 0) {
                        return createPatientAndSetIdentifier(sourceName, nextIdentifierToBe);
                    }
                    else if (sizeOfTheJump > 0) {
                        return getConfirmationViaNgDialog({
                            template: 'views/customIdentifierConfirmation.html',
                            data: {sizeOfTheJump: sizeOfTheJump},
                            scope: $scope,
                            yesCallback: function () {
                                return createPatientAndSetIdentifier(sourceName, nextIdentifierToBe);
                            }
                        });
                    }
                    else {
                        return patientService.create($scope.patient).then(copyPatientProfileDataToScope);
                    }
                });
            };

            var createPromise = function () {
                var deferred = $q.defer();
                var resolved = function() {return deferred.resolve({})};

                setPreferences();
                addNewRelationships();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errMsg) {
                    messagingService.showMessage('formError', errMsg);
                    deferred.reject();
                } else {
                    if (!$scope.hasIdentifierSources()) {
                        createPatientWithOutIdentifierSource().finally(resolved);
                    }
                    else if (!$scope.hasOldIdentifier) {
                        createPatientWithGeneratedIdentifier().finally(resolved)
                    }
                    else {
                        createPatientWithGivenIdentifier().finally(resolved);
                    }
                }
                return deferred.promise;
            };

            var setPreferences = function () {
                preferences.identifierPrefix = $scope.patient.identifierPrefix ? $scope.patient.identifierPrefix.prefix : "";
            };

            var copyPatientProfileDataToScope = function (response) {
                var patientProfileData = response.data;
                $scope.patient.uuid = patientProfileData.patient.uuid;
                $scope.patient.name = patientProfileData.patient.person.names[0].display;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate = dateUtil.now();
                $scope.patient.newlyAddedRelationships = [{}];
                $scope.actions.followUpAction(patientProfileData);
            };

            $scope.create = function() {
                $scope.saveInProgress = true;
                spinner.forPromise(createPromise()).finally(function() {
                    $scope.saveInProgress = false;
                });
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
                $state.go("patient.edit", {patientUuid: $scope.patient.uuid});
            };

            $scope.hasIdentifierSources = function(){
                return $scope.identifierSources.length > 0;
            };

            var createPatientWithOutIdentifierSource = function(){
                return patientService.create($scope.patient).then(copyPatientProfileDataToScope);
            };

        }
    ]);
