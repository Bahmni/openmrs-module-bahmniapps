'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope', '$state', 'patientService', 'Preferences', 'patient', 'spinner', 'appService', 'messagingService','ngDialog','$q',
        function ($scope, $rootScope, $state, patientService, preferences, patientModel, spinner, appService, messagingService, ngDialog,$q) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            $scope.actions = {};
            var configValueForEnterId = appService.getAppDescriptor().getConfigValue('showEnterID');
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.showEnterID = configValueForEnterId === null ? true : configValueForEnterId;

            (function () {
                $scope.patient = patientModel.create();
                $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
                var identifierPrefix = $scope.identifierSources.filter(function (identifierSource) {
                    return identifierSource.prefix === preferences.identifierPrefix;
                });
                $scope.patient.identifierPrefix = identifierPrefix[0] || $scope.identifierSources[0];
                $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            })();

            $scope.create = function () {
                setPreferences();
                var errMsg = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.personAttributeTypes);
                if (errMsg) {
                    messagingService.showMessage('formError', errMsg);
                    return;
                }

                var getConfirmationViaNgDialog = function (ngDialogData,yesCallback) {
                    var ngLocalScope = $scope.$new();
                    ngLocalScope.yes = function () {
                        ngDialog.close();
                        yesCallback();
                    };
                    ngLocalScope.no = function () {
                        ngDialog.close();
                    };
                    ngDialog.open({
                        template: 'views/customIdentifierConfirmation.html',
                        data: ngDialogData,
                        scope: ngLocalScope
                    });
                };

                var createPatientAndSetIdentifier = function (sourceName, nextIdentifierToBe) {
                    spinner.forPromise(
                        $q.all([
                            patientService.create($scope.patient).success(copyPatientProfileDataToScope),
                            patientService.setLatestIdentifier(sourceName, nextIdentifierToBe)
                        ])
                    );
                };
                if (!$scope.hasOldIdentifier) {
                    spinner.forPromise(
                        patientService.generateIdentifier($scope.patient).then(function (response) {
                            $scope.patient.identifier = response.data;
                            patientService.create($scope.patient).success(copyPatientProfileDataToScope);
                        })
                    );

                }
                else {
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
                            getConfirmationViaNgDialog({sizeOfTheJump: sizeOfTheJump}, function () {
                                createPatientAndSetIdentifier(sourceName, nextIdentifierToBe);
                            });
                        }
                        else {
                            spinner.forPromise(patientService.create($scope.patient).success(copyPatientProfileDataToScope));
                        }
                    });
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
                $scope.actions.followUpAction(patientProfileData);
            };

            $scope.afterSave = function () {
                messagingService.showMessage("info", "Saved");
                $state.go("patient.edit", {patientUuid: $scope.patient.uuid});
            };

        }]);
