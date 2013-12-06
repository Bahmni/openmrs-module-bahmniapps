"use strict";

angular.module('opd.adt.controllers')
    .controller('DischargeController', ['$scope', '$rootScope', 'encounterService', '$route', 'appService', 'BedService',
        function ($scope, $rootScope, encounterService, $route, appService, bedService) {

            var appDescriptor = appService.getAppDescriptor();
            var forwardLink = appDescriptor.getConfig("onDischargeForwardTo");
            forwardLink = forwardLink && forwardLink.value;

            $scope.discharge = function () {
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = $scope.encounterConfig.getDischargeEncounterUuid();
                encounterData.observations = [$rootScope.observationList[Bahmni.ADT.Constants["dischargeConceptSet"]]];
                encounterService.create(encounterData).then(function (response) {
                    bedService.getBedDetailsForPatient($scope.patient.uuid).then(function (response) {
                        bedService.freeBed(response.data.results[0].bedId).success(function () {
                            if (forwardUrl) {
                                var forwardUrl = appDescriptor.formatUrl(forwardLink, {'patientUuid' : $scope.patient.uuid});
                                window.location = forwardUrl;
                            }
                        })
                    })
                });
            };
        }]);
