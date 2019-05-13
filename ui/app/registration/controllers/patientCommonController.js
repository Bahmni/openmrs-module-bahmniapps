'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$rootScope', '$http', 'patientAttributeService', 'appService', 'spinner', '$location', 'ngDialog', '$window', '$state', 'patientService',
        function ($scope, $rootScope, $http, patientAttributeService, appService, spinner, $location, ngDialog, $window, $state, patientService) {
            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            var showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox");
            var personAttributes = [];
            var caste;
            var mozAttributes = ['BI', 'Cartao_de_Eleitor', 'Cedula_de_Nascimento', 'NUIT', 'NUIC', 'Passaporte_Mocambicano'];
            var foreignAttributes = ['DIRE', 'NUIT', 'Passaporte_Estrangeiro'];
            $scope.patientDocuments = [];
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
            var dontSaveButtonClicked = false;
            var isHref = false;
            $rootScope.duplicatePatients;
            $rootScope.duplicatePatientCount = 0;
            $rootScope.personSearchResultsConfig = ["NICK_NAME", "PRIMARY_CONTACT_NUMBER_1", "PATIENT_STATUS"];
            $rootScope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action");
            $scope.checkDuplicatePatients = function () {
                var patientGivenName = $scope.patient.givenName || '';
                var patientLastName = $scope.patient.familyName || '';
                var gender = $scope.patient.gender || '';
                var birthDate = $scope.patient.birthdate || '';

                if (birthDate != '') {
                    birthDate = new Date(birthDate);
                }
                var queryParams = patientGivenName + ' ' + patientLastName;
                if (queryParams.length > 1) {
                    patientService.searchDuplicatePatients(queryParams, gender, birthDate).then(function (response) {
                        $rootScope.duplicatePatients = response.pageOfResults;
                        _.map($rootScope.duplicatePatients, function (result) {
                            result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
                        });
                        $rootScope.duplicatePatientCount = $rootScope.duplicatePatients.length;
                    });
                } else {
                    $rootScope.duplicatePatientCount = 0;
                }
            };

            $rootScope.forPatient = function (patient) {
                $scope.selectedPatient = patient;
                return $scope;
            };

            $rootScope.doExtensionAction = function (extension) {
                var forwardTo = appService.getAppDescriptor().formatUrl(extension.url, { 'patientUuid': $scope.selectedPatient.uuid });
                $location.url(forwardTo);
            };

            $scope.updateBirthDateEstimated = function () {
                if ($scope.patient.birthdate) {
                    $scope.isBirthDateEstimatedDisabled = true;
                    $scope.isAgeDisabled = true;
                }
                else {
                    $scope.isBirthDateEstimatedDisabled = false;
                    $scope.isAgeDisabled = false;
                }
            };

            $scope.updateDOB = function () {
                if ($scope.patient.birthdateEstimated) {
                    $scope.isDOBDisabled = true;
                }
                else {
                    $scope.isDOBDisabled = false;
                }
            };

            $scope.$watch('patient.birthdateEstimated', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    if (newValue == true) {
                        $scope.isDOBDisabled = true;
                    }
                    else {
                        $scope.isBirthDateEstimatedDisabled = false;
                    }
                }
            });

            $rootScope.onHomeNavigate = function (event) {
                if ($scope.showSaveConfirmDialogConfig && $state.current.name != "patient.visit") {
                    event.preventDefault();
                    $scope.targetUrl = event.currentTarget.getAttribute('href');
                    isHref = true;
                    $scope.confirmationPrompt(event);
                }
            };

            var stateChangeListener = $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {
                if ($scope.showSaveConfirmDialogConfig && (toState.url == "/search" || toState.url == "/patient/new")) {
                    $scope.targetUrl = toState.name;
                    isHref = false;
                    $scope.confirmationPrompt(event, toState, toParams);
                }
            });

            $scope.confirmationPrompt = function (event, toState) {
                if (dontSaveButtonClicked === false) {
                    if (event) {
                        event.preventDefault();
                    }
                    ngDialog.openConfirm({ template: "../common/ui-helper/views/saveConfirmation.html", scope: $scope });
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
                                    v: "custom:(uuid,name,set,setMembers:(uuid,display,name:(uuid,name),retired))"
                                },
                                withCredentials: true
                            }).then(function (results) {
                                $scope.deathConceptExists = !!results.data.results.length;
                                $scope.deathConcepts = results.data.results[0] ? results.data.results[0].setMembers : [];
                                $scope.deathConcepts = filterRetireDeathConcepts($scope.deathConcepts);
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

            $scope.$watch('patientLoaded', function () {
                if ($scope.patientLoaded) {
                    executeShowOrHideRules();
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

            $scope.nationality = function () {
                if ($scope.patient.NATIONALITY == undefined) {
                    $scope.patient.NATIONALITY = "";
                }
                else {
                    $scope.nationalityChoice = $scope.patient.NATIONALITY.value;
                    if ($scope.nationalityChoice == 'Mocambicano' || $scope.nationalityChoice == 'Mozambican') {
                        $scope.nationalityDocs = mozAttributes;
                    }
                    else if ($scope.nationalityChoice == 'Estrangeiro' || $scope.nationalityChoice == 'Foreigner') {
                        $scope.nationalityDocs = foreignAttributes;
                    }
                }
            };

            $scope.$watch('patient.NATIONALITY.value', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    if (oldValue == undefined) {
                        $scope.nationality();
                    }
                    else {
                        var i;
                        for (i = 0; i < $scope.nationalityDocs.length; i++) {
                            $scope.patient[$scope.nationalityDocs[i]] = "";
                        }

                        $scope.patientDocuments = [];
                        $scope.nationality();
                    }
                }
            });

            $scope.nationalityAttribute = function () {
                $scope.patient.attribute = $scope.nationalAttribute;
                $scope.docRemoved = $scope.nationalAttribute;
            };

            $scope.addDocumentRow = function () {
                if ($scope.patientDocuments.includes($scope.nationalAttribute)) {
                    alert("Selecione outro documento");
                }
                else {
                    $scope.patientDocuments.push($scope.nationalAttribute);
                }
            };

            $scope.removeDoc = function () {
                $scope.nationalityDocs.splice($scope.nationalityDocs.indexOf($scope.docRemoved), 1);
            };

            $scope.removeDocumentRow = function (document) {
                if ($scope.patientDocuments.includes(document)) {
                    $scope.patientDocuments.splice($scope.patientDocuments.indexOf(document), 1);
                    $scope.nationalityDocs.push(document);
                    $scope.patient[document] = "";
                }
                else {
                    alert("Remova outro documento");
                }
            };
        }]);

