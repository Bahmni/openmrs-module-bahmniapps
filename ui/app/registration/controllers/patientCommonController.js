'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$rootScope', '$http', 'patientAttributeService', 'appService', 'patientService', 'spinner', '$location', 'ngDialog', '$window', '$state', '$document', '$translate',
        function ($scope, $rootScope, $http, patientAttributeService, appService, patientService, spinner, $location, ngDialog, $window, $state, $document, $translate) {
            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            var showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox");
            var personAttributes = [];
            var caste;
            var contactAttribute;
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            $scope.showLastName = appService.getAppDescriptor().getConfigValue("showLastName");
            $scope.isLastNameMandatory = $scope.showLastName && appService.getAppDescriptor().getConfigValue("isLastNameMandatory");
            $scope.showBirthTime = appService.getAppDescriptor().getConfigValue("showBirthTime") != null
                ? appService.getAppDescriptor().getConfigValue("showBirthTime") : true;  // show birth time by default
            $scope.genderCodes = Object.keys($rootScope.genderMap);
            $scope.dobMandatory = appService.getAppDescriptor().getConfigValue("dobMandatory") || false;
            $scope.readOnlyExtraIdentifiers = appService.getAppDescriptor().getConfigValue("readOnlyExtraIdentifiers");
            $scope.showSaveConfirmDialogConfig = appService.getAppDescriptor().getConfigValue("showSaveConfirmDialog");
            $scope.showSaveAndContinueButton = false;
            $scope.regExtPoints = appService.getAppDescriptor().getExtensions("org.bahmni.registration.identifier", "link");

            $scope.showExtIframe = false;
            var identifierExtnMap = new Map();
            $scope.attributesToBeDisabled = [];

            $scope.getExtButtons = function (identifierType) {
                var extensionPoint = getExtensionPoint(identifierType);
                if (extensionPoint != null && extensionPoint.extensionParams !== null && extensionPoint.extensionParams.buttons !== null) {
                    return extensionPoint.extensionParams.buttons;
                }
                return null;
            };

            $scope.openIdentifierPopup = function (identifierType, action) {
                var iframe = $document[0].getElementById("extension-popup");
                iframe.src = getExtensionPoint(identifierType).src + "?action=" + action;
                $scope.showExtIframe = true;
                $window.addEventListener("message", function (popupWindowData) {
                    if (popupWindowData.data.patient !== undefined) {
                        $rootScope.extenstionPatient = popupWindowData.data.patient;
                        if ($rootScope.extenstionPatient.id !== undefined) {
                            $rootScope.isExistingPatient = true;
                            if ($rootScope.extenstionPatient.id !== $scope.patient.uuid) {
                                $window.open(Bahmni.Registration.Constants.existingPatient + $rootScope.extenstionPatient.id, "_self");
                            }
                        } else $window.open(Bahmni.Registration.Constants.newPatient, "_self");
                        $scope.updateInfoFromExtSource($rootScope.extenstionPatient);
                        $scope.$digest();
                    }
                    if (popupWindowData.data.patientUuid !== undefined) {
                        $window.open(Bahmni.Registration.Constants.existingPatient + popupWindowData.data.patientUuid, "_self");
                    }
                }, false);
            };

            $scope.isDisabledAttribute = function (attribute) {
                return $scope.attributesToBeDisabled !== undefined && $scope.attributesToBeDisabled.includes(attribute);
            };

            function isIdentifierVoided (identifierType) {
                if ($scope.patient.uuid !== undefined && $rootScope.patientIdentifiers !== undefined) {
                    for (var i = 0; i < $rootScope.patientIdentifiers.length; i++) {
                        var identifier = $rootScope.patientIdentifiers[i];
                        if (identifier.identifierType.display === identifierType) {
                            return true;
                        }
                    }
                }
                return false;
            }

            $scope.showOnlyCreateButton = function (identifierTypes) {
                for (var i = 0; i < identifierTypes.length; i++) {
                    if (identifierTypes[i].registrationNumber) {
                        return true;
                    }
                }
                return false;
            };

            $scope.showIdentifierVerificationButton = function (identifierType, identifierValue) {
                var extenstionPoint = getExtensionPoint(identifierType);
                if (extenstionPoint != null && identifierValue === undefined && _.some($rootScope.currentUser.privileges, {name: extenstionPoint.extensionParams.requiredPrivilege})) {
                    if (identifierExtnMap.get(extenstionPoint.id) === identifierType || identifierExtnMap.get(extenstionPoint.id) === undefined) {
                        if (identifierExtnMap.get(extenstionPoint.id) === undefined) {
                            identifierExtnMap.set(extenstionPoint.id, identifierType);
                        }
                        return !isIdentifierVoided(identifierType);
                    }
                }
                return false;
            };

            function getExtensionPoint (identifierType) {
                if ($scope.regExtPoints !== null) {
                    for (var i = 0; i < $scope.regExtPoints.length; i++) {
                        var identifierTypes = $scope.regExtPoints[i].extensionParams.identifierType;
                        for (var j = 0; j < identifierTypes.length; j++) {
                            if (identifierType === identifierTypes[j]) {
                                return $scope.regExtPoints[i];
                            }
                        }
                    }
                }
                return null;
            }

            $scope.updateInfoFromExtSource = function (patient) {
                $scope.showExtIframe = false;
                var identifierMatch = false;
                for (var i = 0; i < $scope.patient.extraIdentifiers.length; i++) {
                    var identifier = $scope.patient.extraIdentifiers[i];
                    for (var j = 0; j < patient.identifiers.length; j++) {
                        if (patient.identifiers[j]) {
                            var identifierType = patient.identifiers[j].type.text;
                            if (identifier.identifierType.name === identifierType) {
                                identifier.registrationNumber = patient.identifiers[j].value;
                                var extensionParam = getExtensionPoint(identifierType).extensionParams;
                                $scope.attributesToBeDisabled = extensionParam.nonEditable !== null ? extensionParam.nonEditable : null;
                                identifier.generate();
                                if (!identifierMatch) {
                                    extensionParam.addressMap !== null ? updatePatientAddress(patient.address[0], extensionParam.addressMap) : {};
                                    contactAttribute = extensionParam.contact ? extensionParam.contact : "primaryContact";
                                    changePatientDetails(patient, extensionParam.isMiddleNameFieldPresent);
                                    identifierMatch = true;
                                }
                            }
                        }
                    }
                }
            };

            function updatePatientAddress (address, addressMap) {
                $scope.patient.address = {};
                for (var key in addressMap) {
                    if (address[key] && address[key] !== null) {
                        if (key === "line") {
                            for (var index in addressMap[key]) {
                                $scope.patient.address[addressMap[key][index]] = address[key][index];
                            }
                        } else { $scope.patient.address[addressMap[key]] = address[key]; }
                    }
                }
            }

            function updatePatientName (name, isMiddleNameFieldPresent) {
                if (isMiddleNameFieldPresent) {
                    $scope.patient.givenName = name.givenName[0];
                    $scope.patient.middleName = name.givenName.length > 1 ? name.givenName[1] : "";
                }
                else {
                    $scope.patient.givenName = name.givenName.join(" ");
                }

                $scope.patient.familyName = name.familyName;
            }

            function changePatientDetails (changedDetails, isMiddleNameFieldPresent) {
                for (var key in changedDetails) {
                    switch (key) {
                    case 'names':
                        if (changedDetails.names != null) {
                            for (var i = 0; i < changedDetails.names.length; i++) {
                                if (changedDetails.names[i].use === "preferred") {
                                    updatePatientName(changedDetails.names[i], isMiddleNameFieldPresent);
                                    break;
                                }
                            }
                            updatePatientName(changedDetails.names[0], isMiddleNameFieldPresent);
                        }
                        break;
                    case 'gender':
                        if (changedDetails.gender) {
                            $scope.patient.gender = changedDetails.gender;
                        }
                        break;
                    case 'contactPoint':
                        if (changedDetails.contactPoint != null) {
                            for (var i = 0; i < changedDetails.contactPoint.length; i++) {
                                var contact = changedDetails.contactPoint[i];
                                if (contact.system === "phone") { $scope.patient[contactAttribute] = contact.value; }
                            }
                        }
                        break;
                    default:
                        $scope.patient.birthdateEstimated = changedDetails.isBirthDateEstimated;
                        $scope.patient.birthdate = changedDetails.birthDate !== undefined ? new Date(changedDetails.birthDate) : new Date();
                        $scope.patient.calculateAge();
                        break;
                    }
                }
            }

            $scope.closeIdentifierPopup = function () {
                $scope.showExtIframe = false;
            };

            function initPatientNameDisplayOrder () {
                var validNameFields = Bahmni.Registration.Constants.patientNameDisplayOrder;
                var nameFields = appService.getAppDescriptor().getConfigValue("patientNameDisplayOrder") || [];
                var valid = _.every(nameFields, function (val) { return validNameFields.indexOf(val) >= 0; });
                if (nameFields.length !== 3 || !valid) {
                    $scope.patientNameDisplayOrder = validNameFields;
                } else {
                    $scope.patientNameDisplayOrder = nameFields;
                }
            }

            initPatientNameDisplayOrder();
            var dontSaveButtonClicked = false;

            var isHref = false;

            $rootScope.onHomeNavigate = function (event) {
                if ($scope.showSaveConfirmDialogConfig && $state.current.name != "patient.visit") {
                    event.preventDefault();
                    $scope.targetUrl = event.currentTarget.getAttribute('href');
                    isHref = true;
                    $scope.confirmationPrompt(event);
                }
            };
            $scope.getTranslatedPatientControls = function (controls) {
                var translatedName = Bahmni.Common.Util.TranslationUtil.translateAttribute(controls, Bahmni.Common.Constants.registration, $translate);
                return translatedName;
            };
            var stateChangeListener = $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {
                if ($scope.showSaveConfirmDialogConfig && (toState.url == "/search" || toState.url == "/patient/new")) {
                    $scope.targetUrl = toState.name;
                    isHref = false;
                    $scope.confirmationPrompt(event, toState, toParams);
                }
            });

            $scope.localLanguageNameIsRequired = function (nameType) {
                personAttributes = _.keyBy($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                    return attribute.name;
                });
                if (_.isEmpty(nameType)) {
                    return personAttributes.givenNameLocal.required || personAttributes.middleNameLocal.required || personAttributes.familyNameLocal.required;
                }
                return nameType && personAttributes[nameType] && personAttributes[nameType].required;
            };

            $scope.confirmationPrompt = function (event, toState) {
                if (dontSaveButtonClicked === false) {
                    if (event) {
                        event.preventDefault();
                    }
                    ngDialog.openConfirm({template: "../common/ui-helper/views/saveConfirmation.html", scope: $scope});
                }
            };

            $scope.continueWithoutSaving = function () {
                ngDialog.close();
                dontSaveButtonClicked = true;
                if (isHref === true) {
                    $window.open($scope.targetUrl, '_self');
                } else {
                    $state.go($scope.targetUrl);
                }
            };

            $scope.cancelTransition = function () {
                ngDialog.close();
                delete $scope.targetUrl;
            };

            $scope.$on("$destroy", function () {
                stateChangeListener();
            });

            $scope.getDeathConcepts = function () {
                return $http({
                    url: Bahmni.Common.Constants.globalPropertyUrl,
                    method: 'GET',
                    params: {
                        property: 'concept.reasonForDeath'
                    },
                    withCredentials: true,
                    transformResponse: [function (deathConcept) {
                        if (_.isEmpty(deathConcept)) {
                            $scope.deathConceptExists = false;
                        } else {
                            $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                                params: {
                                    name: deathConcept,
                                    v: "custom:(uuid,name,set,names,setMembers:(uuid,display,name:(uuid,name),names,retired))"
                                },
                                withCredentials: true
                            }).then(function (results) {
                                $scope.deathConceptExists = !!results.data.results.length;
                                $scope.deathConcepts = results.data.results[0] ? results.data.results[0].setMembers : [];

                                var activeDeathConcepts = filterRetireDeathConcepts($scope.deathConcepts);
                                _.forEach(activeDeathConcepts, function (deathConcept, index) {
                                    activeDeathConcepts[index] = $scope.updateDisplayFieldToLocaleSpecific(
                                    $scope.filterNamesForLocale(deathConcept, $rootScope.currentUser.userProperties.defaultLocale, "FULLY_SPECIFIED"));
                                });
                            });
                        }
                    }]
                });
            };
            spinner.forPromise($scope.getDeathConcepts());
            var filterRetireDeathConcepts = function (deathConcepts) {
                return _.filter(deathConcepts, function (concept) {
                    return !concept.retired;
                });
            };

            $scope.filterNamesForLocale = function (jsonNames, locale, nametype) {
                var localeNames = _.filter(jsonNames.names, function (name) {
                    return name.locale == locale && name.conceptNameType == nametype;
                });
                if (localeNames.length > 0) {
                    jsonNames.names = localeNames;
                }
                return jsonNames;
            };

            $scope.updateDisplayFieldToLocaleSpecific = function (concept) {
                concept.display = concept.names[0].display;
            };

            $scope.isAutoComplete = function (fieldName) {
                return !_.isEmpty(autoCompleteFields) ? autoCompleteFields.indexOf(fieldName) > -1 : false;
            };

            $scope.showCasteSameAsLastName = function () {
                personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                    return attribute.name.toLowerCase();
                });
                var personAttributeHasCaste = personAttributes.indexOf("caste") !== -1;
                caste = personAttributeHasCaste ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("caste")].name : undefined;
                return showCasteSameAsLastNameCheckbox && personAttributeHasCaste;
            };

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient[caste] = $scope.patient.familyName;
                }
            };

            var showSections = function (sectionsToShow, allSections) {
                _.each(sectionsToShow, function (sectionName) {
                    allSections[sectionName].canShow = true;
                    allSections[sectionName].expand = true;
                });
            };

            var hideSections = function (sectionsToHide, allSections) {
                _.each(sectionsToHide, function (sectionName) {
                    allSections[sectionName].canShow = false;
                });
            };

            var executeRule = function (ruleFunction) {
                var attributesShowOrHideMap = ruleFunction($scope.patient);
                var patientAttributesSections = $rootScope.patientConfiguration.getPatientAttributesSections();
                showSections(attributesShowOrHideMap.show, patientAttributesSections);
                hideSections(attributesShowOrHideMap.hide, patientAttributesSections);
            };

            $scope.handleUpdate = function (attribute) {
                var ruleFunction = Bahmni.Registration.AttributesConditions.rules && Bahmni.Registration.AttributesConditions.rules[attribute];
                if (ruleFunction) {
                    executeRule(ruleFunction);
                }
            };

            var executeShowOrHideRules = function () {
                _.each(Bahmni.Registration.AttributesConditions.rules, function (rule) {
                    executeRule(rule);
                });
            };

            var setAttributesToBeDisabled = function () {
                $scope.patient.extraIdentifiers.forEach(function (identifier) {
                    var extensionPoint = getExtensionPoint(identifier.identifierType.name);
                    if (extensionPoint !== null) {
                        extensionPoint.extensionParams.identifierType.forEach(function (identifiers) {
                            if (identifier.identifierType.name === identifiers) {
                                if (identifier.registrationNumber !== undefined) {
                                    $scope.attributesToBeDisabled = extensionPoint.extensionParams.nonEditable;
                                }
                            }
                        });
                    }
                });
            };

            $scope.$watch('patientLoaded', function () {
                if ($scope.patientLoaded) {
                    executeShowOrHideRules();
                    if (!$scope.createPatient) {
                        if ($scope.patient.extraIdentifiers !== undefined) {
                            setAttributesToBeDisabled();
                        }
                        if ($scope.isExistingPatient && $rootScope.extenstionPatient !== undefined) {
                            $rootScope.isExistingPatient = false;
                            $scope.updateInfoFromExtSource($rootScope.extenstionPatient);
                        }
                    }
                }
            });

            $scope.getAutoCompleteList = function (attributeName, query, type) {
                return patientAttributeService.search(attributeName, query, type);
            };

            $scope.getDataResults = function (data) {
                return data.results;
            };

            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient[caste] = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName !== $scope.patient[caste])) {
                    $scope.patient.sameAsLastName = false;
                }
            });

            $scope.selectIsDead = function () {
                if ($scope.patient.causeOfDeath || $scope.patient.deathDate) {
                    $scope.patient.dead = true;
                }
            };

            $scope.disableIsDead = function () {
                return ($scope.patient.causeOfDeath || $scope.patient.deathDate) && $scope.patient.dead;
            };
        }]);

