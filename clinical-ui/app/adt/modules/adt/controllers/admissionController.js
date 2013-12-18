"use strict";

angular.module('opd.adt.controllers')
    .controller('AdmissionController', ['$scope', '$rootScope', 'encounterService', '$route', 'appService',
    function ($scope, $rootScope, encounterService, $route, appService) {
        var appDescriptor, forwardLink;

        $scope.admissionNote = Bahmni.ADT.dispositionNote($rootScope.visit);
        $scope.admissionNotePresent = function () {
            return $scope.admissionNote && $scope.admissionNote.length > 0;
        }

        appDescriptor = appService.getAppDescriptor();
        forwardLink = appDescriptor.getConfig("onAdmissionForwardTo");
        forwardLink = forwardLink && forwardLink.value;

        $scope.admit = function () {
            var encounterRequest = {};
            encounterRequest.patientUuid = $scope.patient.uuid;
            encounterRequest.encounterTypeUuid = $scope.encounterConfig.getAdmissionEncounterUuid();
            encounterRequest.observations = [$rootScope.observationList[Bahmni.ADT.Constants["adtConceptSet"]]];
            encounterService.create(encounterRequest).success(function (response) {
                var options = {'patientUuid': $scope.patient.uuid, 'encounterUuid': response.encounterUuid};
                if (forwardLink) {
                    var forwardUrl = appDescriptor.formatUrl(forwardLink, options);
                    window.location = forwardUrl;
                }
            });
        };
    }]);
