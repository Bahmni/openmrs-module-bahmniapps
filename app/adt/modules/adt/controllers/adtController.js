"use strict";

angular.module('opd.adt.controllers')
    .controller('AdtController', ['$scope', '$rootScope', 'encounterService', function ($scope, $rootScope, encounterService) {

    $scope.admit = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $scope.encounterConfig.getAdmissionEncounterUuid();
        encounterData.observations = [$rootScope.observationList[Bahmni.ADT.Constants["adtConceptSet"]]];
        encounterService.create(encounterData).success(function () {
            window.location = Bahmni.ADT.Constants.activePatientsListUrl;
        });
    };
}]);
