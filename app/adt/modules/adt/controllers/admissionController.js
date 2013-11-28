"use strict";

angular.module('opd.adt.controllers')
    .controller('AdmissionController', ['$scope', '$rootScope', 'encounterService', '$route', 'appService',
    function ($scope, $rootScope, encounterService, $route, appService) {

        var forwardLink = appService.getAppDescriptor().getExtensions("bahmni.adt.admission.next", "link")[0].url;

        $scope.admit = function () {
            var encounterData = {};
            encounterData.patientUuid = $scope.patient.uuid;
            encounterData.encounterTypeUuid = $scope.encounterConfig.getAdmissionEncounterUuid();
            encounterData.observations = [$rootScope.observationList[Bahmni.ADT.Constants["adtConceptSet"]]];
            encounterService.create(encounterData).success(function () {
                forwardLink = forwardLink.replace("{{patientUuid}}", $scope.patient.uuid);
                window.location = forwardLink;
            });
        };
    }]);
