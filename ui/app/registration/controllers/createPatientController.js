'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'Preferences', 'patient', 'spinner', 'appService', 'messagingService', 'ngDialog', '$q',
        function ($scope, $rootScope, $state, patientService, preferences, patientModel, spinner, appService, messagingService, ngDialog, $q) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;

            (function () {
                $scope.patient = patientModel.create();
                $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
                var identifierPrefix = _.findWhere($scope.identifierSources, {prefix: preferences.identifierPrefix});
                $scope.patient.identifierPrefix = identifierPrefix || $scope.identifierSources[0];
                $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            })();

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
                spinner.forPromise(
                    patientService.setLatestIdentifier(sourceName, nextIdentifierToBe).then(function () {
                        patientService.create($scope.patient).success(copyPatientProfileDataToScope);
                    })
                );
            };

            $scope.create = function () {
                setPreferences();
                addNewRelationships();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.personAttributeTypes);
                if (errMsg) {
                    messagingService.showMessage('formError', errMsg);
                    return;
                }

                if (!$scope.hasOldIdentifier) {
                    spinner.forPromise(
                        patientService.generateIdentifier($scope.patient).then(function (response) {
                            $scope.patient.identifier = response.data;
                            patientService.create($scope.patient).success(copyPatientProfileDataToScope);
                        })
                    );
                }
                else {
                    spinner.forPromise(
                        patientService.getLatestIdentifier($scope.patient.identifierPrefix.prefix).then(function (response) {

                            var sourceName = $scope.patient.identifierPrefix.prefix;
                            var latestIdentifier = response.data;
                            var givenIdentifier = parseInt($scope.patient.registrationNumber);
                            var nextIdentifierToBe = parseInt($scope.patient.registrationNumber) + 1;
                            var sizeOfTheJump = givenIdentifier - latestIdentifier;
                            if (sizeOfTheJump === 0) {
                                createPatientAndSetIdentifier(sourceName, nextIdentifierToBe);
                            }
                            else if (sizeOfTheJump > 0) {
                                getConfirmationViaNgDialog({
                                    template: 'views/customIdentifierConfirmation.html',
                                    data: {sizeOfTheJump: sizeOfTheJump},
                                    scope: $scope,
                                    yesCallback: function () {
                                        createPatientAndSetIdentifier(sourceName, nextIdentifierToBe);
                                    }
                                });
                            }
                            else {
                                patientService.create($scope.patient).success(copyPatientProfileDataToScope);
                            }
                        })
                    );
                }
            };

            var setPreferences = function () {
                preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
            };

            var copyPatientProfileDataToScope = function (patientProfileData) {
                $scope.patient.uuid = patientProfileData.patient.uuid;
                $scope.patient.name = patientProfileData.patient.person.names[0].display;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate = dateUtil.now();
                $scope.patient.newlyAddedRelationships = [{}];
                $scope.actions.followUpAction(patientProfileData);
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "Saved");
                $state.go("patient.edit", {patientUuid: $scope.patient.uuid});
            };

        }
    ]);
