'use strict';

angular.module('bahmni.registration')
    .directive('patientAction', ['$window', '$location', '$state', 'spinner', '$rootScope', '$stateParams',
        '$bahmniCookieStore', 'appService', 'visitService', 'sessionService', 'encounterService',
        'messagingService', '$translate', 'offlineService',
        function ($window, $location, $state, spinner, $rootScope, $stateParams,
                  $bahmniCookieStore, appService, visitService, sessionService, encounterService,
                  messagingService, $translate, offlineService) {
            var controller = function ($scope) {
                var self = this;
                var uuid = $stateParams.patientUuid;
                var editActionsConfig = appService.getAppDescriptor().getExtensions(Bahmni.Registration.Constants.nextStepConfigId, "config");
                var loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid;
                var defaultVisitType = $rootScope.regEncounterConfiguration.getDefaultVisitType(loginLocationUuid);
                defaultVisitType = defaultVisitType ? defaultVisitType : appService.getAppDescriptor().getConfigValue('defaultVisitType');
                var showStartVisitButton = appService.getAppDescriptor().getConfigValue("showStartVisitButton");
                showStartVisitButton = showStartVisitButton ? showStartVisitButton : true;
                var isOfflineApp = offlineService.isOfflineApp();

                function setForwardActionKey() {
                    if (editActionsConfig.length === 0 && isOfflineApp) {
                        $scope.forwardActionKey = undefined;
                    } else if (editActionsConfig.length === 0) {
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
                    spinner.forPromise(visitService.search(searchParams).then(function (data) {
                        self.hasActiveVisit = data.data.results && (data.data.results.length > 0);
                        self.hasActiveVisit = self.hasActiveVisit ? self.hasActiveVisit : (isOfflineApp ? true : false);
                        setForwardActionKey();
                    }));
                };


                $scope.visitControl = new Bahmni.Common.VisitControl(
                    $rootScope.regEncounterConfiguration.getVisitTypesAsArray(),
                    defaultVisitType, encounterService, $translate, visitService
                );

                $scope.visitControl.onStartVisit = function () {
                    $scope.setSubmitSource('startVisit');
                };

                $scope.setSubmitSource = function (source) {
                    $scope.actions.submitSource = source;
                };

                $scope.showStartVisitButton = function () {
                    return showStartVisitButton;
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
                    spinner.forPromise($scope.visitControl.createVisitOnly(patientProfileData.patient.uuid, $rootScope.visitLocation).then(function () {
                        if (forwardUrl) {
                            $window.location.href = forwardUrl;
                        } else {
                            goToVisitPage(patientProfileData);
                        }
                    }), function () {
                        $state.go('patient.edit', {patientUuid: $scope.patient.uuid});
                    });
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