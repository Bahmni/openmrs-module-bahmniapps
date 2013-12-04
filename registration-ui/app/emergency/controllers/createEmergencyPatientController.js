'use strict';

angular.module('registration.emergency.controllers')
    .controller('CreateEmergencyPatientController', [ '$rootScope', '$scope', '$location', 'patient', 'patientService', 'encounterService', 'Preferences', 'addressAttributeService', 'spinner',
    function ($rootScope, $scope, $location, patientModel, patientService, encounterService, preferences, addressAttributeService, spinner) {
        var init = function(){
            $scope.patient = patientModel.create();
            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            var identifierPrefix = $scope.identifierSources.filter(function (identifierSource) {
                return identifierSource.prefix === preferences.identifierPrefix;
            });

            $scope.patient.identifierPrefix = identifierPrefix[0] || $scope.identifierSources[0];

            var visitTypeUuid = $scope.encounterConfiguration.visitTypes[constants.visitType.emergency];
            var encounterTypeUuid = $scope.encounterConfiguration.encounterTypes[constants.encounterType.registration];
            $scope.encounter = {visitTypeUuid: visitTypeUuid, encounterTypeUuid: encounterTypeUuid, observations: []};

        };
        init();

        var createPatient = function() {
            return patientService.generateIdentifier($scope.patient)
                .then(function (data) {
                    $scope.patient.identifier = data.data;
                    return patientService.create($scope.patient);
                }).then(successCallback);
        };

        var setPreferences = function() {
            preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
        };

        var successCallback = function(response) {
            var patient = response.data.patient;
            $scope.patient.uuid = patient.uuid;
            $scope.patient.identifier = patient.identifiers[0].identifier;
            $scope.patient.name = patient.person.names[0].display;
            setPreferences();
            patientService.rememberPatient($scope.patient);
        };

        var createVisit = function() {
            $scope.encounter.patientUuid = $scope.patient.uuid;
            return encounterService.create($scope.encounter).success(function(data) {
                $location.path("/summary");
            });
        };

        $scope.create = function(){
            var patientPromise = createPatient().then(function(data) {
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

        $scope.getVillageList = function (id, query, type) {
            return addressAttributeService.search("cityVillage", query);
        };

        $scope.villageSelected = function (item) {
            $scope.patient.address.cityVillage = item.addressField;
        };
    }]);
