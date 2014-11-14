'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', '$rootScope', 'patientService', 'encounterService', 'visitService','$location', 'Preferences', '$stateParams', 'openmrsPatientMapper', '$window', '$q','spinner', 'registrationCardPrinter', 'appService', 'sessionService',
        function ($scope, $rootScope, patientService, encounterService, visitService,$location, preferences, $stateParams, patientMapper, $window, $q, spinner, registrationCardPrinter, appService, sessionService) {
            var uuid;
            var editActionsConfig = [];
            var defaultActions = ["save", "print"];
            var defaultVisitType = appService.getAppDescriptor().getConfigValue('defaultVisitType');
            var locationUuid = sessionService.getLoginLocationUuid();
            var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType];

            var identifyEditActions = function() {
                editActionsConfig = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.edit.action", "config");
                var editActions = editActionsConfig.filter(function(config) {
                    if (config.extensionParams) {
                        return config.extensionParams.action ? defaultActions.indexOf(config.extensionParams.action) > -1 : false;
                    } else {
                        return false;
                    }
                });
                $scope.editActions = editActions;
            };

            $scope.patient = {};
            (function () {
                uuid = $stateParams.patientUuid;
                var getPatientPromise = patientService.get(uuid).success(function (openmrsPatient) {
                    $scope.openMRSPatient = openmrsPatient;
                    $scope.patient = patientMapper.map(openmrsPatient);
                    $scope.patient.isNew = $stateParams.newpatient;
                });
                var searchActiveVisitsPromise = visitService.search({patient: uuid, includeInactive: false, v: "custom:(uuid)"}).success(function(data){
                    $scope.hasActiveVisit = data.results.length > 0;
                    var actionName = $scope.hasActiveVisit ? "enterVisitDetails" : "startVisit"
                    defaultActions.push(actionName);
                    identifyEditActions();
                });

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.success(function(data) {
                    var encountersWithObservations = data.results.filter(function (encounter) {
                        return encounter.obs.length > 0
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, searchActiveVisitsPromise, isDigitized]));
            })();

            $scope.visitControl = new Bahmni.Common.VisitControl($rootScope.regEncounterConfiguration.getVistTypesAsArray(), defaultVisitType, encounterService);
            $scope.visitControl.onStartVisit = function() {
                $scope.setSubmitSource('startVisit');
            };

            $scope.setSubmitSource = function (source) {
                $scope.submitSource = source;
            };

            var goToVisitPage = function(patientData) {
                $scope.patient.uuid = patientData.patient.uuid;
                $scope.patient.name = patientData.patient.person.names[0].display;
                $location.path("/patient/" + patientData.patient.uuid + "/visit");
            };

            var createEncounterObject = function() {
                var encounter = {locationUuid: locationUuid, providers: [], encounterTypeUuid: regEncounterTypeUuid}
                if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                    encounter.providers.push( { "uuid" : $rootScope.currentProvider.uuid } );
                }
                return encounter;
            }

            var createVisit = function(patientProfileData){
                return $scope.visitControl.createVisit(patientProfileData.patient.uuid, createEncounterObject()).success(function() {
                    $scope.patient.uuid = patientProfileData.patient.uuid;
                    $scope.patient.name = patientProfileData.patient.person.names[0].display;
                    goToActionUrl("startVisit", patientProfileData);
                });
            };

            var goToActionUrl = function(actionName, patientProfileData) {
                if ($scope.editActions) {
                    var matchedExtensions = $scope.editActions.filter(function(extension) {
                        return extension.extensionParams && extension.extensionParams.action === actionName;
                    });
                    if (matchedExtensions.length > 0) {
                        var extensionParams = matchedExtensions[0].extensionParams;
                        if (extensionParams && extensionParams.forwardUrl) {
                            var fwdUrl = appService.getAppDescriptor().formatUrl(extensionParams.forwardUrl, {'patientUuid' : patientProfileData.patient.uuid} );
                            $location.url(fwdUrl);
                        }
                    }
                }
            };
            
            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, $scope.openMRSPatient).success(function (patientProfileData) {
                    var submitSource = $scope.submitSource;
                    $scope.submitSource = null;
                    switch(submitSource) {
                        case 'print':
                            registrationCardPrinter.print($scope.patient);
                            return goToActionUrl(submitSource, patientProfileData);
                        case 'startVisit':
                            return createVisit(patientProfileData);                        
                        case 'enterVisitDetails':
                            return goToVisitPage(patientProfileData);
                        case 'save':
                        default:
                            return goToActionUrl(submitSource, patientProfileData);
                    }
                });
                spinner.forPromise(patientUpdatePromise);
            };

            $scope.showBackButton = function () {
                return $stateParams.newpatient;
            };

            $scope.back = function () {
                $window.history.back();
            };
        }]);