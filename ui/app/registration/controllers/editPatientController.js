'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', '$rootScope', 'patientService', 'encounterService', 'visitService','$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window', '$q','spinner', 'printer', 'appService',
        function ($scope, $rootScope, patientService, encounterService, visitService,$location, preferences, $route, patientMapper, $window, $q, spinner, printer, appService) {
            var uuid;
            var editActionsConfig = [];
            var defaultActions = ["save", "print"];
            var constants = Bahmni.Registration.Constants;
            var regEncounterTypeUuid = $scope.regEncounterConfiguration.encounterTypes[constants.encounterType.registration];

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
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = patientService.get(uuid).success(function (openmrsPatient) {
                    $scope.openMRSPatient = openmrsPatient;
                    $scope.patient = patientMapper.map(openmrsPatient);
                    $scope.patient.isNew = ($location.search()).newpatient;
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

            var getDefaultVisitType = function() {
                var defaultVisitType = $route.current.params.visitType || constants.defaultVisitTypeName;
                var visitTypesAsArray = $rootScope.regEncounterConfiguration.getVistTypesAsArray();
                var visitArray = visitTypesAsArray.filter(function(visitType) {
                    return visitType.name === defaultVisitType;
                });
                return visitArray.length > 0 ? visitArray[0].name : constants.defaultVisitTypeName;
            };

            $scope.visitControl = new Bahmni.Registration.VisitControl($rootScope.regEncounterConfiguration.getVistTypesAsArray(), getDefaultVisitType(), visitService);
            $scope.visitControl.onStartVisit = function() {
                $scope.setSubmitSource('startVisit');
            };

            $scope.patientCommon = function () {
                return $route.routes['/patientcommon'].templateUrl;
            };

            $scope.setSubmitSource = function (source) {
                $scope.submitSource = source;
            };

            var goToVisitPage = function(patientData) {
                $scope.patient.uuid = patientData.patient.uuid;
                $scope.patient.name = patientData.patient.person.names[0].display;
                patientService.rememberPatient($scope.patient);
                $location.path("/patient/" + patientData.patient.uuid + "/visit");
            };

            var createEncounterObject = function() {
                var encounter = {
                    encounterTypeUuid:regEncounterTypeUuid
                }
                encounter.providers = encounter.providers || [];
                if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                    encounter.providers.push( { "uuid" : $rootScope.currentProvider.uuid } );
                }
                return encounter;
            }

            var createVisit = function(patientProfileData){
                return $scope.visitControl.createVisit(patientProfileData.patient.uuid, createEncounterObject()).success(function() {
                    $scope.patient.uuid = patientProfileData.patient.uuid;
                    $scope.patient.name = patientProfileData.patient.person.names[0].display;
                    patientService.rememberPatient($scope.patient);
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
                    $rootScope.server_error = null;
                    switch(submitSource) {
                        case 'print':
                            printer.print('registrationCard');
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
                return !$location.search().newpatient;
            };

            $scope.back = function () {
                $window.history.back();
            };

            $scope.printLayout = function () {
                return $route.routes['/printPatient'].templateUrl;
            };
        }]);