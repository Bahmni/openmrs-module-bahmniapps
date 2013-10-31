'use strict';

angular.module('registration.emergency.controllers')
    .controller('CreateEmergencyPatientController', ['$scope', '$location', 'patient', 'patientService', 'visitService', 'Preferences', 'addressAttributeService', 'spinner',
    function ($scope, $location, patientModel, patientService, visitService, preferences, addressAttributeService, spinner) {
        var init = function(){
            $scope.patient = patientModel.create();
            $scope.centers = constants.centers;
            $scope.patient.centerID = $scope.centers.filter(function (center) {
                return center.name === preferences.centerID
            })[0];

            var visitTypeUuid = $scope.encounterConfiguration.visitTypes[constants.visitType.emergency];
            var encounterTypeUuid = $scope.encounterConfiguration.encounterTypes[constants.encounterType.registration];
            $scope.encounter = {visitTypeUuid: visitTypeUuid, encounterTypeUuid: encounterTypeUuid, observations: []};

        };
        init();

        var createPatient = function() {
            var mapper = new Bahmni.Registration.Emergency.PatientMapper();
            return patientService.create($scope.patient, mapper).success(function(data) {
                $scope.patient.uuid = data.uuid;
                $scope.patient.identifier = data.identifier;
                $scope.patient.name = data.name;
                patientService.rememberPatient($scope.patient);
            });
        };

        var createVisit = function() {
            $scope.encounter.patientUuid = $scope.patient.uuid;
            return visitService.create($scope.encounter).success(function(data) {
                $location.path("/summary");
            });
        };

        $scope.create = function(){
            var patientPromise = createPatient().success(function(data) {
                var visitPromise = createVisit();
                spinner.forPromise(visitPromise);
            });
            spinner.forPromise(patientPromise);
        };

        $scope.getAddressDataResults = function (data) {
            return data.map(function (addressField) {
                return {'value': addressField.name, 'label': addressField.name + ( addressField.parent ? ", " + addressField.parent.name : "" ), addressField: addressField}
            });
        };

        $scope.getVillageList = function (query) {
            return addressAttributeService.search("cityVillage", query);
        };

        $scope.villageSelected = function (item) {
            $scope.patient.address.cityVillage = item.addressField;
        };

    }]);
