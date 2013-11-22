"use strict";

angular.module('opd.adt.controllers')
    .controller('AdmissionController', ['$scope', '$rootScope', 'encounterService', '$route',
    function ($scope, $rootScope, encounterService, $route) {

    $scope.admit = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $scope.encounterConfig.getAdmissionEncounterUuid();
        encounterData.observations = [$rootScope.observationList[Bahmni.ADT.Constants["adtConceptSet"]]];
        encounterService.create(encounterData).success(function () {
            window.location = "../adt/#/visit/" + $route.current.params.visitUuid + "/bed-management";
        });
    };
}]);
