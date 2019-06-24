'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'patient', 'spinner', 'appService', 'messagingService', 'ngDialog', '$q',
        function ($scope, $rootScope, $state, patientService, patient, spinner, appService, messagingService, ngDialog, $q) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            $scope.patient = {};
            var personAttributes = [];
            var errorMessage;
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");
            $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;
            $scope.today = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(dateUtil.now());

            var getPersonAttributeTypes = function () {
                return $rootScope.patientConfiguration.attributeTypes;
            };

            var initTodaysDate = function () {
                if (personAttributes.length == 0) {
                    personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                        return attribute.name;
                    });
                }
                var personAttributeHasTodaysDate = personAttributes.indexOf("TodaysDate") !== -1;
                var todaysDateAttrName = personAttributeHasTodaysDate ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("TodaysDate")].name : undefined;
                if (todaysDateAttrName) {
                    $scope.patient[todaysDateAttrName] = Bahmni.Common.Util.DateUtil.today();
                }
            };

            var prepopulateDefaultsInFields = function () {
                var personAttributeTypes = getPersonAttributeTypes();
                var patientInformation = appService.getAppDescriptor().getConfigValue("patientInformation");
                if (!patientInformation || !patientInformation.defaults) {
                    return;
                }
                var defaults = patientInformation.defaults;
                var defaultVariableNames = _.keys(defaults);

                var hasDefaultAnswer = function (personAttributeType) {
                    return _.includes(defaultVariableNames, personAttributeType.name);
                };

                var isConcept = function (personAttributeType) {
                    return personAttributeType.format === "org.openmrs.Concept";
                };

                var setDefaultAnswer = function (personAttributeType) {
                    $scope.patient[personAttributeType.name] = defaults[personAttributeType.name];
                };

                var setDefaultConcept = function (personAttributeType) {
                    var defaultAnswer = defaults[personAttributeType.name];
                    var isDefaultAnswer = function (answer) {
                        return answer.fullySpecifiedName === defaultAnswer;
                    };

                    _.chain(personAttributeType.answers).filter(isDefaultAnswer).each(function (answer) {
                        $scope.patient[personAttributeType.name] = {
                            conceptUuid: answer.conceptId,
                            value: answer.fullySpecifiedName
                        };
                    }).value();
                };

                _.chain(personAttributeTypes)
                    .filter(hasDefaultAnswer)
                    .each(setDefaultAnswer).filter(isConcept).each(setDefaultConcept).value();
            };

            var expandSectionsWithDefaultValue = function () {
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function (section) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    section.expand = false; // section.expand || (!!notNullAttribute);
                });
            };

            var init = function () {
                $scope.patient = patient.create();
                prepopulateDefaultsInFields();
                expandSectionsWithDefaultValue();
                initTodaysDate();
                $scope.patientLoaded = false;
            };

            init();

            var prepopulateFields = function () {
                var fieldsToPopulate = appService.getAppDescriptor().getConfigValue("prepopulateFields");
                if (fieldsToPopulate) {
                    _.each(fieldsToPopulate, function (field) {
                        var addressLevel = _.find($scope.addressLevels, function (level) {
                            return level.name === field;
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
                $scope.patient.relationships = newRelationships;
            };

            var updateUniqueArtId = function () {
                var personUniqueArtId;
                if ($scope.patient.gender) {
                    personUniqueArtId = $scope.patient.gender === 'F' ? '1' : ($scope.patient.gender === 'M' ? '2' : '3');
                }
                var personAttributeHasMobileCountryCode = personAttributes.indexOf("MobileCountryCode") !== -1;
                var personAttributeMobileCountryCd = personAttributeHasMobileCountryCode ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("MobileCountryCode")].name : undefined;
                if (personAttributeMobileCountryCd && $scope.patient[personAttributeMobileCountryCd].value) {
                    var personAttributeMobileCountryCdAnwser = _.find($rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("MobileCountryCode")].answers, function (anwser) {
                        return anwser.fullySpecifiedName === $scope.patient[personAttributeMobileCountryCd].value;
                    });
                    personUniqueArtId += personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'South Sudan' ? '5'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'DRC' ? '1'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'Eretria' ? '2'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'Ethiopia' ? '3'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'Kenya' ? '4'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'Uganda' ? '6'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'Rwanda' ? '7'
                        : (personAttributeMobileCountryCdAnwser.fullySpecifiedName === 'Tanzania' ? '8' : '9')))))));
                }
                var personAttributeHasOrderOfBirth = personAttributes.indexOf("OrderOfBirth") !== -1;
                var personAttributeOrderOfBirth = personAttributeHasOrderOfBirth ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("OrderOfBirth")].name : undefined;
                if (personAttributeOrderOfBirth && $scope.patient[personAttributeOrderOfBirth]) {
                    personUniqueArtId = personUniqueArtId + '0' + $scope.patient[personAttributeOrderOfBirth];
                }
                if ($scope.patient.birthdate) {
                    var patientBirthdate = Bahmni.Common.Util.DateUtil.getDateWithoutTime($scope.patient.birthdate);
                    personUniqueArtId = personUniqueArtId + patientBirthdate[2] + patientBirthdate[3];
                }
                if ($scope.patient.givenName && $scope.patient.givenName.length > 2) {
                    personUniqueArtId = personUniqueArtId + $scope.patient.givenName[0] + $scope.patient.givenName[1];
                }
                if ($scope.patient.familyName && $scope.patient.familyName.length > 2) {
                    personUniqueArtId = personUniqueArtId + $scope.patient.familyName[0] + $scope.patient.familyName[1];
                }
                var personAttributeHasKeyPopulationType = personAttributes.indexOf("KeyPopulationType") !== -1;
                var personAttributeKeyPopulationType = personAttributeHasKeyPopulationType ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("KeyPopulationType")].name : undefined;
                if (personAttributeKeyPopulationType && $scope.patient[personAttributeKeyPopulationType] && $scope.patient[personAttributeKeyPopulationType].value) {
                    var personAttributeKeyPopulationTypeAnwser = _.find($rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("KeyPopulationType")].answers, function (anwser) {
                        return anwser.fullySpecifiedName === $scope.patient[personAttributeKeyPopulationType].value;
                    });
                    personUniqueArtId += personAttributeKeyPopulationTypeAnwser.fullySpecifiedName === 'Female Sex Worker' ? '1'
                        : (personAttributeKeyPopulationTypeAnwser.fullySpecifiedName === 'Men who have sex with men (MSM)' ? '2' : '3');
                }
                if (personUniqueArtId && personUniqueArtId.length === 11) {
                    return personUniqueArtId;
                }
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

            var copyPatientProfileDataToScope = function (response) {
                var patientProfileData = response.data;
                $scope.patient.uuid = patientProfileData.patient.uuid;
                $scope.patient.name = patientProfileData.patient.person.names[0].display;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate = dateUtil.now();
                $scope.patient.newlyAddedRelationships = [{}];
                $scope.actions.followUpAction(patientProfileData);
            };

            var createPatient = function (jumpAccepted) {
                var personAttributeUniqueArtId = updateUniqueArtId();
                $scope.patient.primaryIdentifier.identifier = personAttributeUniqueArtId;
                return patientService.create($scope.patient, jumpAccepted).then(function (response) {
                    copyPatientProfileDataToScope(response);
                }, function (response) {
                    if (response.status === 412) {
                        var data = _.map(response.data, function (data) {
                            return {
                                sizeOfTheJump: data.sizeOfJump,
                                identifierName: _.find($rootScope.patientConfiguration.identifierTypes, {uuid: data.identifierType}).name
                            };
                        });
                        getConfirmationViaNgDialog({
                            template: 'views/customIdentifierConfirmation.html',
                            data: data,
                            scope: $scope,
                            yesCallback: function () {
                                return createPatient(true);
                            }
                        });
                    }
                    if (response.isIdentifierDuplicate) {
                        errorMessage = response.message;
                    }
                });
            };

            var createPromise = function () {
                var deferred = $q.defer();
                createPatient().finally(function () {
                    return deferred.resolve({});
                });
                return deferred.promise;
            };

            $scope.create = function () {
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(function (errorMessage) {
                        messagingService.showMessage('error', errorMessage);
                    });
                    return $q.when({});
                }
                return spinner.forPromise(createPromise()).then(function (response) {
                    if (errorMessage) {
                        messagingService.showMessage("error", errorMessage);
                        errorMessage = undefined;
                    }
                });
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
                $state.go("patient.edit", {
                    patientUuid: $scope.patient.uuid
                });
            };
        }
    ]);
