'use strict';

angular.module('registration.patient.controllers')
    .controller('CreatePatientController', ['$scope', '$rootScope','patientService', 'visitService','$location', 'Preferences', '$route', 'patient', '$window', 'errorCode', 'dateUtil', 'spinner', 'printer', 'appService', '$timeout',
    function ($scope, $rootScope, patientService, visitService, $location, preferences, $route, patientModel, $window, errorCode, dateUtil, spinner, printer, appService, $timeout) {
        var createActionsConfig = [];
        var defaultActions = ["save", "print", "startVisit"];

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
            $scope.centers = constants.centers;
            $scope.patient.centerID = $scope.centers.filter(function (center) {
                return center.name === preferences.centerID
            })[0];
            $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            identifyEditActions();
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

        var setPreferences = function () {
            preferences.centerID = $scope.patient.centerID.name;
            preferences.hasOldIdentifier = $scope.hasOldIdentifier;
        };

        var successCallback = function (patientData) {
            var patientUrl = $location.absUrl().replace("new", patientData.uuid) + "?newpatient=true";
            $scope.patient.uuid = patientData.uuid;
            $scope.patient.identifier = patientData.identifier;
            $scope.patient.name = patientData.name;
            $scope.patient.isNew = true;
            $scope.patient.registrationDate = dateUtil.now();
        };

        var followUpAction = function(patientData) {
            if($scope.submitSource == 'startVisit') {
                $scope.visitControl.createVisit(patientData.uuid).success(function(){
                    var patientUrl = $location.absUrl().replace("new", patientData.uuid) + "?newpatient=true";
                    $scope.patient.registrationDate = dateUtil.now();
                    patientService.rememberPatient($scope.patient);
                    $window.history.pushState(null, null, patientUrl);
                    $location.path("/patient/" + patientData.uuid + "/visit");
                }).error(function(){ spinner.hide(); });
            } else if ($scope.submitSource == 'print') {
                $timeout(function(){
                    printer.print('registrationCard');
                    goToActionUrl('print', {'patientUuid' : patientData.uuid});
                });
            } else {
                goToActionUrl($scope.submitSource, patientData);
            }
        };

        var formatUrl = function (url, options) {
            var temp = url;
            for (var key in options) {
                temp = temp.replace("{{"+key+"}}", options[key]);
            }
            return temp;
        };

        var goToActionUrl = function(actionName, patientData) {
            if ($scope.createActions) {
                var matchedExtensions = $scope.createActions.filter(function(extension) {
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

        $scope.printLayout = function () {
            return $route.routes['/printPatient'].templateUrl;
        };

        $scope.create = function () {
            setPreferences();
            var createPatientPromise = patientService.create($scope.patient).success(successCallback).success(followUpAction).error(function (data) {
                spinner.hide();
                if (errorCode.isOpenERPError(data)) {
                    successCallback(data.patient);
                }
            });
            spinner.show();
        };
    }]);
