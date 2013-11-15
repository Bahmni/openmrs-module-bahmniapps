'use strict';

angular.module('registration.patient.controllers')
    .controller('CreatePatientController', ['$scope', '$rootScope','patientService', 'visitService','$location', 'Preferences', '$route', 'patient', '$window', 'errorCode', 'date', 'spinner',
    function ($scope, $rootScope, patientService, visitService, $location, preferences, $route, patientModel, $window, errorCode, date, spinner) {
        (function () {
            $scope.patient = patientModel.create();
            $scope.centers = constants.centers;
            $scope.patient.centerID = $scope.centers.filter(function (center) {
                return center.name === preferences.centerID
            })[0];
            $scope.hasOldIdentifier = preferences.hasOldIdentifier;
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

        var setPreferences = function () {
            preferences.centerID = $scope.patient.centerID.name;
            preferences.hasOldIdentifier = $scope.hasOldIdentifier;
        };

        var successCallback = function (patientData) {
            var patientUrl = $location.absUrl().replace("new", patientData.uuid) + "?newpatient=true";
            if($scope.submitSource == 'startVisit') {
                $scope.visitControl.createVisit(patientData.uuid).success(function(){
                    $scope.patient.uuid = patientData.uuid;
                    $scope.patient.identifier = patientData.identifier;
                    $scope.patient.name = patientData.name;
                    $scope.patient.isNew = true;
                    $scope.patient.registrationDate = date.now();
                    patientService.rememberPatient($scope.patient);
                    $window.history.pushState(null, null, patientUrl);
                    $location.path("/patient/" + patientData.uuid + "/visit");
                }).error(function(){ spinner.hide(); });
            } else {
                $window.location.replace(patientUrl);
            }
        };

        $scope.create = function () {
            setPreferences();
            var createPatientPromise = patientService.create($scope.patient).success(successCallback).error(function (data) {
                spinner.hide();
                if (errorCode.isOpenERPError(data))
                    successCallback(data.patient);
            });
            spinner.show();
        };
    }]);
