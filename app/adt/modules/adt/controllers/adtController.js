"use strict";

angular.module('opd.adt.controllers')
    .controller('AdtController', ['$scope', '$rootScope',function ($scope, $rootScope) {

    $scope.admit = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $scope.encounterConfig.getAdmissionEncounterUuid();
        addObservation(encounterData);
    };

    var addObservation = function (encounterData) {
        $rootScope.observationList
    }

}]);
