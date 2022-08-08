'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper',
        '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope', 'auditLogService', '$translate',
        function ($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner,
                  appService, messagingService, $rootScope, auditLogService, $translate) {
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
                setReadOnlyFields();
                expandDataFilledSections();
                $scope.patientLoaded = true;
                $scope.enableWhatsAppButton = (appService.getAppDescriptor().getConfigValue("enableWhatsAppButton") || Bahmni.Registration.Constants.enableWhatsAppButton) && ($scope.patient.phoneNumber != undefined);
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

                var identifiers = patientService.getAllPatientIdentifiers(uuid);

                identifiers.then(function (response) {
                    $rootScope.patientIdentifiers = response.data.results;
                });

                isDigitized.then(function (data) {
                    var encountersWithObservations = data.data.results.filter(function (encounter) {
                        return encounter.obs.length > 0;
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized, identifiers]));
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

            $scope.sendWhatsAppMessage = function () {
                var whatsAppMessage = appService.getAppDescriptor().getConfigValue("whatsAppMessage") || $translate.instant(Bahmni.Registration.Constants.whatsAppMessage);
                var startIndex = whatsAppMessage.indexOf("{");
                var endIndex = whatsAppMessage.indexOf("}");
                var messageSubstring = whatsAppMessage.substring(startIndex, endIndex + 1);
                var patientAttributes = messageSubstring.substring(1, messageSubstring.length - 1).split(",");
                var patientDetails = "";
                for (var patt in patientAttributes) {
                    switch (patientAttributes[patt]) {
                    case 'patientId':
                        if (patientDetails.length > 0) {
                            patientDetails = patientDetails + ", ";
                        }
                        patientDetails = patientDetails + $scope.patient.primaryIdentifier.identifier;
                        break;
                    case 'name':
                        if (patientDetails.length > 0) {
                            patientDetails = patientDetails + ", ";
                        }
                        patientDetails = patientDetails + $scope.patient.givenName + " " + $scope.patient.familyName;
                        break;
                    case 'age':
                        if (patientDetails.length > 0) {
                            patientDetails = patientDetails + ", ";
                        }
                        patientDetails = patientDetails + $scope.patient.age.years + " years";
                        break;
                    case 'gender':
                        if (patientDetails.length > 0) {
                            patientDetails = patientDetails + ", ";
                        }
                        patientDetails = patientDetails + $scope.patient.gender;
                        break;
                    }
                }
                var phoneNumber = $scope.patient.phoneNumber.replace("+", "");
                var url = "https://api.whatsapp.com/send?phone=" + phoneNumber + "&text=" + whatsAppMessage.replace(messageSubstring, patientDetails);
                window.open(url);
            };

            $scope.afterSave = function () {
                auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
            };
        }]);

