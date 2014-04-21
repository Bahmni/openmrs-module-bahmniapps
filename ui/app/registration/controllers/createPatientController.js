'use strict';

angular.module('bahmni.registration')
    .controller('CreatePatientController', ['$scope', '$rootScope','patientService', 'visitService','$location', 'Preferences', '$route', 'patient', '$window', 'spinner', 'registrationCardPrinter', 'appService', '$timeout',
    function ($scope, $rootScope, patientService, visitService, $location, preferences, $route, patientModel, $window, spinner, registrationCardPrinter, appService, $timeout) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var createActionsConfig = [];
        var defaultActions = ["save", "print", "startVisit"];
        var constants = Bahmni.Registration.Constants;
        var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[constants.encounterType.registration];
        var identifyEditActions = function() {
            createActionsConfig = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.create.action", "config");
            var createActions = createActionsConfig.filter(function(config) {
                if (config.extensionParams) {
                    return config.extensionParams.action ? defaultActions.indexOf(config.extensionParams.action) > -1 : false;
                } else {
                    return false;
                }
            });
            $scope.createActions = createActions;
        };

        (function () {
            $scope.patient = patientModel.create();
            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            var identifierPrefix = $scope.identifierSources.filter(function (identifierSource) {
                return identifierSource.prefix === preferences.identifierPrefix;
            });
            $scope.patient.identifierPrefix = identifierPrefix[0] || $scope.identifierSources[0];
            $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            identifyEditActions();
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

        var setPreferences = function () {
            preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
            preferences.hasOldIdentifier = $scope.hasOldIdentifier;
        };

        var successCallback = function (patientProfileData) {
            $scope.patient.uuid = patientProfileData.patient.uuid;
            $scope.patient.identifier = patientProfileData.patient.identifiers[0].identifier;
            $scope.patient.name = patientProfileData.patient.person.names[0].display;
            $scope.patient.isNew = true;
            $scope.patient.registrationDate = dateUtil.now();
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

        var followUpAction = function(patientProfileData) {
            if($scope.submitSource === 'startVisit') {
                return $scope.visitControl.createVisit(patientProfileData.patient.uuid, createEncounterObject()).success(function(){
                    var patientUrl = $location.absUrl().replace("new", patientProfileData.patient.uuid) + "?newpatient=true";
                    $scope.patient.registrationDate = dateUtil.now();
                    patientService.rememberPatient($scope.patient);
                    $window.history.pushState(null, null, patientUrl);
                    $location.path("/patient/" + patientProfileData.patient.uuid + "/visit");
                });
            } else if ($scope.submitSource === 'print') {
                $timeout(function(){
                    registrationCardPrinter.print($scope.patient);
                    goToActionUrl('print', patientProfileData);
                });
            } else {
                goToActionUrl($scope.submitSource, patientProfileData);
            }
        };

        var goToActionUrl = function(actionName, patientProfileData) {
            if ($scope.createActions) {
                var matchedExtensions = $scope.createActions.filter(function(extension) {
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

        $scope.create = function () {
            setPreferences();
            if (!$scope.patient.identifier) {
                spinner.forPromise(patientService.generateIdentifier($scope.patient).then(function (response) {
                    $scope.patient.identifier = response.data;
                    return patientService.create($scope.patient).success(successCallback).success(followUpAction);
                }));
            } else {
                spinner.forPromise(patientService.create($scope.patient).success(successCallback).success(followUpAction));
            }
        };
    }]);
