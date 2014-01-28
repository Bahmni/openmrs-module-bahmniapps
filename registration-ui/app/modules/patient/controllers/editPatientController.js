'use strict';

angular.module('registration.patient.controllers')
    .controller('EditPatientController', ['$scope', '$rootScope', 'patientService', 'visitService','$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window', '$q','spinner', 'printer', 'appService',
        function ($scope, $rootScope, patientService, visitService,$location, preferences, $route, patientMapper, $window, $q, spinner, printer, appService) {
            var uuid;
            var editActionsConfig = [];
            var defaultActions = ["save", "print"];

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
                    if ($scope.hasActiveVisit) {
                        defaultActions.push("enterVisitDetails");
                    } else {
                        defaultActions.push("startVisit");
                    }
                    identifyEditActions();
                });
                spinner.forPromise($q.all([getPatientPromise, searchActiveVisitsPromise]));
            })();

            var getDefaultVisitType = function() {
                var defaultVisitType = $route.current.params.visitType || constants.defaultVisitTypeName;
                var visitTypesAsArray = $rootScope.encounterConfiguration.getVistTypesAsArray();
                var visitArray = visitTypesAsArray.filter(function(visitType) {
                    return visitType.name == defaultVisitType;
                });
                return visitArray.length > 0 ? visitArray[0].name : constants.defaultVisitTypeName;
            };

            $scope.visitControl = new Bahmni.Registration.VisitControl($rootScope.encounterConfiguration.getVistTypesAsArray(), getDefaultVisitType(), visitService);
            $scope.visitControl.onStartVisit = function(visitType) {
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

            var createVisit = function(patientProfileData){
                $scope.visitControl.createVisit(patientProfileData.patient.uuid).success(function() {
                    $scope.patient.uuid = patientProfileData.patient.uuid;
                    $scope.patient.name = patientProfileData.patient.person.names[0].display;
                    patientService.rememberPatient($scope.patient);
                    goToActionUrl("startVisit", patientProfileData);
                }).error(function() { spinner.hide(); });
            };

            var formatUrl = function (url, options) {
                var temp = url;
                for (var key in options) {
                    temp = temp.replace("{{"+key+"}}", options[key]);
                }
                return temp;
            };

            var goToActionUrl = function(actionName, patientProfileData) {
                if ($scope.editActions) {
                    var matchedExtensions = $scope.editActions.filter(function(extension) {
                        return extension.extensionParams && extension.extensionParams.action === actionName;
                    });
                    if (matchedExtensions.length > 0) {
                        var extensionParams = matchedExtensions[0].extensionParams;
                        if (extensionParams && extensionParams.forwardUrl) {
                            var fwdUrl = formatUrl(extensionParams.forwardUrl, {'patientUuid' : patientProfileData.patient.uuid} );
                            spinner.hide();
                            $location.url(fwdUrl);
                        }
                    }
                }
            };
            
            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, $scope.openMRSPatient).success(function (patientProfileData) {
                    switch($scope.submitSource) {
                        case 'print':
                            printer.print('registrationCard');
                            spinner.hide();
                            goToActionUrl($scope.submitSource, patientProfileData);
                            break;
                        case 'startVisit':
                            createVisit(patientProfileData);                        
                            break;
                        case 'enterVisitDetails':
                            goToVisitPage(patientProfileData);
                            break;
                        case 'save':
                        default:
                            spinner.hide();
                            goToActionUrl($scope.submitSource, patientProfileData);
                    }
                    $scope.submitSource = null;
                    $rootScope.server_error = null;
                });
                spinner.forPromise(patientUpdatePromise, {doNotHideOnSuccess: true});
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