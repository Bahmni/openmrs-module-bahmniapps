"use strict";

angular.module('opd.adt.controllers')
    .controller('AdtController', ['$scope', function ($scope) {

    $scope.admit = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $scope.encounterConfig.getAdmissionEncounterUuid();
        addObservation(encounterData);
    };

    var addObservation = function (encounterData) {
    }

}]);
