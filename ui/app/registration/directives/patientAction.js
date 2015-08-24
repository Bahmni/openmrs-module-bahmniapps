'use strict';

angular.module('bahmni.registration')
    .directive('patientAction', ['$window', '$location', '$state', 'spinner', '$rootScope', '$stateParams', 'appService', 'visitService', 'sessionService', 'encounterService', 'messagingService',
        function ($window, $location, $state, spinner, $rootScope, $stateParams, appService, visitService, sessionService, encounterService, messagingService) {
            var controller = function ($scope) {
                var self = this;
                var uuid = $stateParams.patientUuid;
                var editActionsConfig = appService.getAppDescriptor().getExtensions(Bahmni.Registration.Constants.nextStepConfigId, "config");

                function setForwardActionKey() {
                    if (editActionsConfig.length == 0) {
                        $scope.forwardActionKey = self.hasActiveVisit ? 'enterVisitDetails' : 'startVisit';
                    } else {
                        $scope.actionConfig = editActionsConfig[0];
                        $scope.forwardActionKey = 'configAction';
                    }
                }

                var init = function () {
                    if (_.isEmpty(uuid)) {
                        self.hasActiveVisit = false;
                        setForwardActionKey();
                        return;
                    }
                    var searchParams = {
                        patient: uuid,
                        includeInactive: false,
                        v: "custom:(uuid)"
                    };
                    spinner.forPromise(visitService.search(searchParams).success(function (data) {
                        self.hasActiveVisit = data.results.length > 0;
                        setForwardActionKey();
                    }));
                };

                $scope.visitControl = new Bahmni.Common.VisitControl(
                    $rootScope.regEncounterConfiguration.getVistTypesAsArray(),
                    appService.getAppDescriptor().getConfigValue('defaultVisitType'),
                    encounterService
                );

                $scope.visitControl.onStartVisit = function () {
                    $scope.setSubmitSource('startVisit');
                };

                $scope.setSubmitSource = function (source) {
                    $scope.actions.submitSource = source;
                };

                $scope.actions.followUpAction = function (patientProfileData) {
                    switch ($scope.actions.submitSource) {
                        case 'startVisit':
                            return createVisit(patientProfileData);
                        case 'enterVisitDetails':
                            return goToVisitPage(patientProfileData);
                        case 'configAction':
                            return handleConfigAction(patientProfileData);
                        case 'save':
                            $scope.afterSave();
                    }
                };

                var handleConfigAction = function (patientProfileData) {
                    var forwardUrl = appService.getAppDescriptor().formatUrl($scope.actionConfig.extensionParams.forwardUrl, {'patientUuid': patientProfileData.patient.uuid});
                    if (!self.hasActiveVisit) {
                        createVisit(patientProfileData, forwardUrl);
                    } else {
                        $window.location.href = forwardUrl;
                    }
                };

                var goToVisitPage = function (patientData) {
                    $scope.patient.uuid = patientData.patient.uuid;
                    $scope.patient.name = patientData.patient.person.names[0].display;
                    $location.path("/patient/" + patientData.patient.uuid + "/visit");
                };


                var createVisit = function (patientProfileData, forwardUrl) {
                    spinner.forPromise($scope.visitControl.createVisit(patientProfileData.patient.uuid, createEncounterObject()).success(function () {
                        if (forwardUrl) {
                            $window.location.href = forwardUrl;
                        } else {
                            goToVisitPage(patientProfileData);
                        }
                    }).error(function () {
                        $state.go('patient.edit', {patientUuid: $scope.patient.uuid});
                    }));
                };

                var createEncounterObject = function () {
                    var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType];
                    var locationUuid = sessionService.getLoginLocationUuid();
                    var encounter = {
                        locationUuid: locationUuid,
                        providers: [],
                        encounterTypeUuid: regEncounterTypeUuid
                    };
                    if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                        encounter.providers.push({"uuid": $rootScope.currentProvider.uuid});
                    }
                    return encounter;
                };

                init();
            };
            return {
                restrict: 'E',
                templateUrl: 'views/patientAction.html',
                controller: controller
            }
        }
    ]);