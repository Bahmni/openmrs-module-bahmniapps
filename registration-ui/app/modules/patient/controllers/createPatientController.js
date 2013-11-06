'use strict';

angular.module('registration.patient.controllers')
    .controller('CreatePatientController', ['$scope', '$rootScope','patientService', '$location', 'Preferences', '$route', 'patient', '$window', 'errorCode', 'date', 'spinner',
    function ($scope, $rootScope, patientService, $location, preferences, $route, patientModel, $window, errorCode, date, spinner) {
        (function () {
            $scope.patient = patientModel.create();
            $scope.centers = constants.centers;
            $scope.patient.centerID = $scope.centers.filter(function (center) {
                return center.name === preferences.centerID
            })[0];
            $scope.hasOldIdentifier = preferences.hasOldIdentifier;
        })();

        $scope.visitTypes = $rootScope.encounterConfiguration.getVistTypesAsArray();
        
        $scope.startVisit = function(visitType) {
            $scope.setSubmitSource('startVisit');
            $scope.selectedVisitType = visitType;
        };

        $scope.startVisitButtonText = function(visitType) {
            return "Start " + visitType.name + " visit";
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

        var successCallback = function (data) {
            var patientUrl = $location.absUrl().replace("new", data.uuid) + "?newpatient=true";
            if($scope.submitSource == 'startVisit') {
                $scope.patient.uuid = data.uuid;
                $scope.patient.identifier = data.identifier;
                $scope.patient.name = data.name;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate = date.now();
                patientService.rememberPatient($scope.patient);
                $window.history.pushState(null, null, patientUrl);
                $location.path("/visit");
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
