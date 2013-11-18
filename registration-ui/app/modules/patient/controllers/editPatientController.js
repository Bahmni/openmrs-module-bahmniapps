'use strict';

angular.module('registration.patient.controllers')
    .controller('EditPatientController', ['$scope', '$rootScope', 'patientService', 'visitService','$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window', '$q','spinner', 'printer', 'appService',
        function ($scope, $rootScope, patientService, visitService,$location, preferences, $route, patientMapper, $window, $q, spinner, printer, appService) {
            var uuid;
            var editActionsConfig = [];
            var defaultActions = ["save", "print"];

            var identifyEditActions = function() {
                editActionsConfig = appService.allowedAppExtensions("org.bahmni.registration.patient.edit.action", "config");
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

            $scope.visitControl = new Bahmni.Registration.VisitControl($rootScope.encounterConfiguration.getVistTypesAsArray(), constants.defaultVisitTypeName, visitService);
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
                $scope.patient.uuid = patientData.uuid;
                $scope.patient.name = patientData.name;
                patientService.rememberPatient($scope.patient);
                $location.path("/patient/" + patientData.uuid + "/visit");
            };

            var createVisit = function(patientData){
                $scope.visitControl.createVisit(patientData.uuid).success(function() {
                    $scope.patient.uuid = patientData.uuid;
                    $scope.patient.name = patientData.name;
                    patientService.rememberPatient($scope.patient);
                    goToActionUrl("startVisit", patientData);
                }).error(function() { spinner.hide(); });
            };

            var formatUrl = function (url, options) {
                var temp = url;
                for (var key in options) {
                    temp = temp.replace("{{"+key+"}}", options[key]);
                }
                return temp;
            };

            var goToActionUrl = function(actionName, patientData) {
                if ($scope.editActions) {
                    var matchedExtensions = $scope.editActions.filter(function(extension) {
                        return extension.extensionParams && extension.extensionParams.action === actionName;
                    });
                    if (matchedExtensions.length > 0) {
                        var extensionParams = matchedExtensions[0].extensionParams;
                        if (extensionParams && extensionParams.forwardUrl) {
                            var fwdUrl = formatUrl(extensionParams.forwardUrl, {'patientUuid' : patientData.uuid} );
                            spinner.hide();
                            $location.url(fwdUrl);
                        }
                    }
                }
            };
            
            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, uuid).success(function (patientData) {
                    switch($scope.submitSource) {
                        case 'print':
                            printer.print('registrationCard');
                            spinner.hide();
                            break;
                        case 'startVisit':
                            createVisit(patientData);                        
                            break;
                        case 'enterVisitDetails':
                            goToVisitPage(patientData);
                            break;
                        case 'save':
                        default:
                            spinner.hide();
                            goToActionUrl($scope.submitSource, patientData);
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