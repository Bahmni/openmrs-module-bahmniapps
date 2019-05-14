'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper',
        '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope', 'auditLogService',
        function ($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner,
            appService, messagingService, $rootScope, auditLogService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");
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

            var successCallBack = function (openmrsPatient) {
                $scope.openMRSPatient = openmrsPatient["patient"];
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                var mozAttributes = ['BI', 'Cartao_de_Eleitor', 'Cedula_de_Nascimento', 'NUIT', 'NUIC', 'Passaporte_Mocambicano'];
                var foreignAttributes = ['DIRE', 'NUIT', 'Passaporte_Estrangeiro'];
                $scope.editPatientDocuments = [];
                var nationalityVar = function () {
                    if ($scope.patient.NATIONALITY == undefined) {
                        $scope.patient.NATIONALITY = "";
                    }
                    else {
                        $scope.nationalityChoice = $scope.patient.NATIONALITY.value;
                        if ($scope.nationalityChoice == 'Mocambicano' || $scope.nationalityChoice == 'Mozambican') {
                            $scope.nationalityDocs = mozAttributes;
                            $scope.existDocs = $scope.nationalityDocs;
                        }
                        else if ($scope.nationalityChoice == 'Estrangeiro' || $scope.nationalityChoice == 'Foreigner') {
                            $scope.nationalityDocs = foreignAttributes;
                            $scope.existDocs = $scope.nationalityDocs;
                        }
                    }
                };
                nationalityVar();

                $scope.nationality = function () {
                    if ($scope.patient.NATIONALITY == undefined) {
                        $scope.patient.NATIONALITY = "";
                    }
                    else {
                        $scope.nationalityChoice = $scope.patient.NATIONALITY.value;
                        if ($scope.nationalityChoice == 'Mocambicano' || $scope.nationalityChoice == 'Mozambican') {
                            var mozAttributes = ['BI', 'Cartao_de_Eleitor', 'Cedula_de_Nascimento', 'NUIT', 'NUIC', 'Passaporte_Mocambicano'];
                            $scope.nationalityDocs = mozAttributes;
                            $scope.existDocs = $scope.nationalityDocs;
                        }
                        else if ($scope.nationalityChoice == 'Estrangeiro' || $scope.nationalityChoice == 'Foreigner') {
                            var foreignAttributes = ['DIRE', 'NUIT', 'Passaporte_Estrangeiro'];
                            $scope.nationalityDocs = foreignAttributes;
                            $scope.existDocs = $scope.nationalityDocs;
                        }
                    }
                };
                var existingPatientDocs = function () {
                    if ($scope.nationalityDocs == undefined) {
                        $scope.nationalityDocs = "";
                    }
                    else {
                        var i = 0;
                        for (i = 0; i <= $scope.nationalityDocs.length; i++) {
                            _.each($scope.nationalityDocs, function (doc) {
                                if ($scope.patient[doc] == undefined) { }
                                else {
                                    if ($scope.patient[doc].length > 0) {
                                        $scope.editPatientDocuments.push(doc);
                                        $scope.nationalityDocs.splice($scope.nationalityDocs.indexOf(doc), 1);
                                        $scope.existDocs = $scope.nationalityDocs;
                                    }
                                }
                            });
                        }
                    }
                };

                existingPatientDocs();
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

                            $scope.editPatientDocuments = [];
                            $scope.nationality();
                        }
                    }
                });
                $scope.nationalityEditAttribute = function (document) {
                    $scope.attributeChoice = document;
                    $scope.patient.attribute = $scope.attributeChoice;
                    $scope.docRemoved = $scope.attributeChoice;
                };
                $scope.addEditDocRow = function () {
                    if ($scope.editPatientDocuments.includes($scope.attributeChoice)) {
                        alert("Selecione outro documento");
                    }
                    else {
                        $scope.editPatientDocuments.push($scope.attributeChoice);
                    }
                };

                $scope.removeEditDoc = function () {
                    $scope.existDocs.splice($scope.existDocs.indexOf($scope.docRemoved), 1);
                };

                $scope.removeEditDocRow = function (document) {
                    if ($scope.editPatientDocuments.includes(document)) {
                        $scope.editPatientDocuments.splice($scope.editPatientDocuments.indexOf(document), 1);
                        $scope.existDocs.push(document);
                        $scope.patient[document] = "";
                    }
                    else {
                        alert("Remova outro documento");
                    }
                };
                if ($scope.patient.birthdateEstimated == false) {
                    $scope.isBirthDateEstimatedDisabled = true;
                    $scope.isAgeDisabled = true;
                }
                if ($scope.patient.hasOwnProperty('SECTOR_SELECT')) {
                    if ($scope.patient['SECTOR_SELECT'].value == 'ATIP') {
                        $scope.isATIPSelectShown = true;
                    }
                }
                setReadOnlyFields();
                expandDataFilledSections();
                $scope.patientLoaded = true;
            };

            var expandDataFilledSections = function () {
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function (section) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    section.expand = section.expanded || (notNullAttribute ? true : false);
                });
            };

            (function () {
                var getPatientPromise = patientService.get(uuid).then(successCallBack);

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.then(function (data) {
                    var encountersWithObservations = data.data.results.filter(function (encounter) {
                        return encounter.obs.length > 0;
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized]));
            })();

            $scope.update = function () {
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(function (errorMessage) {
                        messagingService.showMessage('error', errorMessage);
                    });
                    return $q.when({});
                }

                return spinner.forPromise(patientService.update($scope.patient, $scope.openMRSPatient).then(function (result) {
                    var patientProfileData = result.data;
                    if (!patientProfileData.error) {
                        successCallBack(patientProfileData);
                        $scope.actions.followUpAction(patientProfileData);
                    }
                }));
            };

            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function (relationship) {
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = _.concat(newRelationships, $scope.patient.deletedRelationships);
            };

            $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields ? ($scope.readOnlyFields[field] ? true : false) : undefined;
            };

            $scope.afterSave = function () {
                auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
            };

            $scope.handleSectorChange = function () {
                if ($scope.patient['SECTOR_SELECT'].value == 'ATIP') {
                    $scope.isATIPSelectShown = true;
                }
                else {
                    $scope.isATIPSelectShown = false;
                    $scope.patient['ATIP_SELECT'] = null;
                }
            };
        }]);
