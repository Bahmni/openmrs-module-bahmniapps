"use strict";

angular.module('opd.adt.controllers')
    .controller('DischargeController', ['$scope', '$rootScope', 'encounterService', '$route', 'appService', 'BedService',
        function ($scope, $rootScope, encounterService, $route, appService, bedService) {

            var forwardLink = appService.getAppDescriptor().getExtensions("bahmni.adt.discharge.next", "link")[0].url;

            $scope.discharge = function () {
                var encounterData = {};
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = $scope.encounterConfig.getDischargeEncounterUuid();
                encounterData.observations = [$rootScope.observationList[Bahmni.ADT.Constants["dischargeConceptSet"]]];
                encounterService.create(encounterData).then(function (response) {
                    bedService.getBedDetailsForPatient($scope.patient.uuid).then(function (response) {
                        bedService.freeBed(response.data.results[0].bedId).success(function () {
                            forwardLink = forwardLink.replace("{{patientUuid}}", $scope.patient.uuid);
                            window.location = forwardLink;
                        })
                    })
                });
            };
        }]);
