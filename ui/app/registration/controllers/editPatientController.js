'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper',
        '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope', 'auditLogService',
        function ($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner,
                  appService, messagingService, $rootScope, auditLogService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            var personAttributes = [];
            $scope.patient = {};
            $scope.actions = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");

            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());
            $scope.patientLoaded = false;

            /* var setReadOnlyFields = function () {
                $scope.readOnlyFields = {};
                var readOnlyFields = appService.getAppDescriptor().getConfigValue("readOnlyFields");
                angular.forEach(readOnlyFields, function (readOnlyField) {
                    if ($scope.patient[readOnlyField]) {
                        $scope.readOnlyFields[readOnlyField] = true;
                    }
                });
            }; */

            var successCallBack = function (openmrsPatient) {
                $scope.openMRSPatient = openmrsPatient["patient"];
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                var personAttributeHasHei = personAttributes.indexOf("HIVExposedInfant(HEI)No") !== -1;
                var personAttributeHei = personAttributeHasHei
                    ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("HIVExposedInfant(HEI)No")].name : undefined;
                if(personAttributeHasHei && personAttributeHei){
                    $scope.patient.heiNumber = $scope.patient[personAttributeHei];
                }
                // setReadOnlyFields();
                expandDataFilledSections();
                if ($scope.patient.relationships.length == 0) {
                    $scope.patient.newlyAddedRelationships = [{}];
                } else {
                    $scope.patient.newlyAddedRelationships = [];
                }
                $scope.patient.permanentAddress = $scope.patient.permanentAddress || {};
                $scope.patient.permanentAddress.preferred = true;
                $scope.patient.currentAddress = $scope.patient.currentAddress || {};
                $scope.patient.permanentAddress.address15 = "Is permanent dummy address";
                $scope.patient.currentAddress.address15 = "Is current dummy address";
                $scope.patient.birthdate = moment($scope.patient.birthdate).format('DD-MM-YYYY');
            };

            var expandDataFilledSections = function () {
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function (section) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    section.expand = false; // section.expand || (!!notNullAttribute);
                });
            };

            var init = function () {
                if (personAttributes.length == 0) {
                    personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                        return attribute.name;
                    });
                }
                var getPatientPromise = patientService.get(uuid).then(successCallBack);
                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.then(function (data) {
                    var encountersWithObservations = data.data.results.filter(function (encounter) {
                        return encounter.obs.length > 0;
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });
                // return spinner.forPromise($q.all([getPatientPromise, isDigitized]));
                return getPatientPromise.then(function () {
                    spinner.forPromise(isDigitized);
                }).then(function () {
                    $scope.patient.inEditPatient = true;
                    $scope.patientLoaded = true;
                });
            };
            spinner.forPromise(init());

            var setReadOnlyEditFields = function () {
                if (personAttributes.length == 0) {
                    personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                        return attribute.name;
                    });
                }
                var personAttributeHasTypeofPatient = personAttributes.indexOf("TypeofPatient") !== -1;
                var personAttributeTypeofPatient = personAttributeHasTypeofPatient
                    ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("TypeofPatient")].name : undefined;
                if (personAttributeTypeofPatient && $scope.patient[personAttributeTypeofPatient] &&
                        $scope.patient[personAttributeTypeofPatient].value === "Walk-In") {
                    for (var i = 0; i < personAttributes.length; i++) {
                        var attrName = personAttributes[i];
                        var attrElement = angular.element(document.getElementById(attrName));
                        if (attrElement) {
                            attrElement.attr('disabled', true);
                        }
                    }
                } else {
                    var readOnlyPatientAttributes = ["HealthFacilityName", "TodaysDate", "RegistrantName", "UniqueArtNo", "TypeofPatient", "HIVExposedInfant(HEI)No"];
                    for (var i = 0; i < readOnlyPatientAttributes.length; i++) {
                        var attrName = readOnlyPatientAttributes[i];
                        var attrElement = angular.element(document.getElementById(attrName));
                        if (attrElement) {
                            attrElement.attr('disabled', true);
                        }
                    }
                }
            };

            var disableEditFieldsForInfant = function () {
                if (personAttributes.length == 0) {
                    personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                        return attribute.name;
                    });
                }
                if (($scope.patient.age.years === 0 && $scope.patient.age.months <= 12) ||
                    ($scope.patient.age.years === 1 && $scope.patient.age.months <= 6)) {
                    $scope.infantPatient = true;
                }
                for (var i = 0; i < personAttributes.length; ++i) {
                    var attrName = personAttributes[i];
                    if (attrName === "MaritalStatus") {
                        var attrElement = angular.element(document.getElementById(attrName));
                        if (attrElement) {
                            $scope.$applyAsync(attrElement.attr('disabled', $scope.infantPatient));
                        }
                        break;
                    }
                }
            };

            $scope.processEnabledSave = function () {
                $scope.patient.inEditPatient = false;
                $scope.$applyAsync(angular.element(document).find("#myForm :input").attr('disabled', false));
                $scope.$applyAsync(angular.element(document).find("button").attr('disabled', false));
                $scope.$applyAsync(angular.element(document).find("#editBtn").attr('disabled', true));
                disableEditFieldsForInfant();
                setReadOnlyEditFields();
            };

            $scope.update = function () {
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(function (errorMessage) {
                        messagingService.showMessage('error', errorMessage);
                    });
                    return $q.when({});
                }
                $scope.patientLoaded = false;
                return spinner.forPromise(patientService.update($scope.patient, $scope.openMRSPatient).then(function (result) {
                    var patientProfileData = result.data;
                    if (!patientProfileData.error) {
                        successCallBack(patientProfileData);
                        $scope.patient.inEditPatient = true;
                        $scope.patientLoaded = true;
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

            /* $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields ? (!!$scope.readOnlyFields[field]) : undefined;
            }; */

            $scope.afterSave = function () {
                auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
            };
        }]);
