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
                $scope.patient.newlyAddedRelationships = [{}];
                prepopulateDefaultsInFields();
                expandSectionsWithDefaultValue();
                initTodaysDate();
                $scope.patientLoaded = false;
                $scope.heiRelationship = false;
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
                if (personAttributes.length == 0) {
                    personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                        return attribute.name;
                    });
                }
                var personAttributeHasTypeofPatient = personAttributes.indexOf("TypeofPatient") !== -1;
                var personAttributeTypeofPatient = personAttributeHasTypeofPatient
                    ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("TypeofPatient")].name : undefined;
                if (personAttributeTypeofPatient && $scope.patient[personAttributeTypeofPatient] &&
                        ($scope.patient[personAttributeTypeofPatient].value === "NewPatient")) {
                        //    || $scope.patient[personAttributeTypeofPatient].value === "HeiRelationship")) {
                    var idgenPrefix = {};
                    idgenPrefix.identifierPrefix = {};
                    idgenPrefix.identifierPrefix.prefix = "UID";
                    return patientService.generateIdentifier(idgenPrefix).then(function (response) {
                        var uniqueArtIdentifier = "";
                        if (response && response.data && response.data.length > 0) {
                            var personAttributeHasHealthFacility = personAttributes.indexOf("HealthFacilityName") !== -1;
                            var personAttributeHealthFacility = personAttributeHasHealthFacility
                                ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("HealthFacilityName")].name : undefined;
                            if (personAttributeHealthFacility && $scope.patient[personAttributeHealthFacility] &&
                                    $scope.patient[personAttributeHealthFacility].value === "Juba Teaching Hospital") {
                                uniqueArtIdentifier = _.padStart(response.data, 8, '0');
                                uniqueArtIdentifier = "CES/JTH-" + uniqueArtIdentifier;
                            } else if (personAttributeHealthFacility && $scope.patient[personAttributeHealthFacility] &&
                                    $scope.patient[personAttributeHealthFacility].value === "Nimule") {
                                uniqueArtIdentifier = _.padStart(response.data, 8, '0');
                                uniqueArtIdentifier = "EES/NMC-" + uniqueArtIdentifier;
                            }
                        }
                        var personAttributeHasUniqueArtNo = personAttributes.indexOf("UniqueArtNo") !== -1;
                        var personAttributeUniqueArtNo = personAttributeHasUniqueArtNo
                            ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("UniqueArtNo")].name : undefined;
                        $scope.patient[personAttributeUniqueArtNo] = uniqueArtIdentifier;
                        // if ($scope.patient.primaryIdentifier) {
                        $scope.patient.primaryIdentifier.identifier = uniqueArtIdentifier;
                        // }
                    }).then(function () {
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
                    });
                } else {
                    var personAttributeHasUniqueArtNo = personAttributes.indexOf("UniqueArtNo") !== -1;
                    var personAttributeUniqueArtNo = personAttributeHasUniqueArtNo
                        ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("UniqueArtNo")].name : undefined;
                    // if ($scope.patient.primaryIdentifier) {
                    $scope.patient.primaryIdentifier.identifier = $scope.patient[personAttributeUniqueArtNo];
                    // $scope.patient.extraIdentifiers[0].preferred = true;
                    // }
                    // $scope.patient.extraIdentifiers[0].identifier = $scope.patient[personAttributeUniqueArtNo];
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
                }
            };

            var createPromise = function () {
                var deferred = $q.defer();
                createPatient().finally(function () {
                    return deferred.resolve({});
                });
                return deferred.promise;
            };

            var validateUniqueArtNo = function () {
                var personAttributeHasTypeofPatient = personAttributes.indexOf("TypeofPatient") !== -1;
                var personAttributeTypeofPatient = personAttributeHasTypeofPatient
                    ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("TypeofPatient")].name : undefined;
                if (personAttributeTypeofPatient && $scope.patient[personAttributeTypeofPatient] &&
                        ($scope.patient[personAttributeTypeofPatient].value === "ExistingPatient")) {
                    var personAttributeHasUniqueArtNo = personAttributes.indexOf("UniqueArtNo") !== -1;
                    var personAttributeUniqueArtNo = personAttributeHasUniqueArtNo
                        ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("UniqueArtNo")].name : undefined;
                    var uniqueArt = $scope.patient[personAttributeUniqueArtNo];
                    var personAttributeHasHealthFacility = personAttributes.indexOf("HealthFacilityName") !== -1;
                    var personAttributeHealthFacility = personAttributeHasHealthFacility
                        ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("HealthFacilityName")].name : undefined;
                    if (personAttributeHealthFacility && $scope.patient[personAttributeHealthFacility] &&
                            $scope.patient[personAttributeHealthFacility].value === "Juba Teaching Hospital") {
                        if (uniqueArt && !(uniqueArt.startsWith("CES/JTH-") && uniqueArt.length === 16)) {
                            return "Unique art no should be 16 characters starting with CES/JTH-";
                        }
                    } else if (personAttributeHealthFacility && $scope.patient[personAttributeHealthFacility] &&
                            $scope.patient[personAttributeHealthFacility].value === "Nimule") {
                        if (uniqueArt && !(uniqueArt.startsWith("EES/NMC-") && uniqueArt.length === 16)) {
                            return "Unique art no should be 16 characters starting with EES/NMC-";
                        }
                    }
                }
                return "";
            };

            $scope.create = function () {
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                var customValidateArtMsg = validateUniqueArtNo();
                if (customValidateArtMsg !== "") {
                    errorMessages.push(customValidateArtMsg);
                }
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
