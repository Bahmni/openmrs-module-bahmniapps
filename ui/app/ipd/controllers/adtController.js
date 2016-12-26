"use strict";

angular.module('bahmni.ipd')
    .controller('AdtController', ['$scope', 'spinner', 'bedService', 'appService', 'sessionService', 'encounterService', 'visitService', 'messagingService', function ($scope, spinner, bedService, appService, sessionService, encounterService, visitService, messagingService) {
        $scope.encounterConfig = $scope.$parent.encounterConfig;
        $scope.defaultVisitTypeName = appService.getAppDescriptor().getConfigValue('defaultVisitType');
        $scope.adtObservations = [];
        $scope.dashboardConfig = appService.getAppDescriptor().getConfigValue('dashboard');
        $scope.getAdtConceptConfig = $scope.dashboardConfig.conceptName;
        var actionConfigs = {};
        var encounterConfig = $scope.encounterConfig;
        var locationUuid = sessionService.getLoginLocationUuid();
        var visitTypes = encounterConfig.getVisitTypes();

        $scope.admit = function () {
            return createEncounterAndContinue().then(function (response) {
                assignBedToPatient($scope.bed, response.data.patientUuid, response.data.encounterUuid);
            });
        };

        var assignBedToPatient = function (bed, patientUuid, encounterUuid) {
            spinner.forPromise(bedService.assignBed(bed.bedId, patientUuid, encounterUuid).success(function () {
                bed.status = "OCCUPIED";
                messagingService.showMessage('info', "Bed " + bed.bedNumber + " is assigned successfully");
            }));
        };

        var createEncounterAndContinue = function () {
            var currentVisitTypeUuid = getCurrentVisitTypeUuid();
            if (currentVisitTypeUuid !== null) {
                var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterTypeUuid(), currentVisitTypeUuid);
                return encounterService.create(encounterData).success(function (response) {
                    if ($scope.visitSummary === null) {
                        visitService.getVisitSummary(response.visitUuid).then(function (response) {
                            $scope.visitSummary = new Bahmni.Common.VisitSummary(response.data);
                        });
                    }
                    // forwardUrl(response, "onAdmissionForwardTo");
                });
            } else if ($scope.defaultVisitTypeName === null) {
                messagingService.showMessage("error", "MESSAGE_DEFAULT_VISIT_TYPE_NOT_FOUND_KEY");
            } else {
                messagingService.showMessage("error", "MESSAGE_DEFAULT_VISIT_TYPE_INVALID_KEY");
            }
            return $q.when({});
        };

        var getVisitTypeUuid = function (visitTypeName) {
            var visitType = _.find(visitTypes, {name: visitTypeName});
            return visitType && visitType.uuid || null;
        };

        var defaultVisitTypeUuid = getVisitTypeUuid($scope.defaultVisitTypeName);

        var getCurrentVisitTypeUuid = function () {
            if ($scope.visitSummary && $scope.visitSummary.dateCompleted === null) {
                return getVisitTypeUuid($scope.visitSummary.visitType);
            }
            return defaultVisitTypeUuid;
        };

        var getEncounterData = function (encounterTypeUuid, visitTypeUuid) {
            var encounterData = {};
            encounterData.patientUuid = $scope.patient.uuid;
            encounterData.encounterTypeUuid = encounterTypeUuid;
            encounterData.visitTypeUuid = visitTypeUuid;
            encounterData.observations = $scope.adtObservations;
            encounterData.observations = _.filter(encounterData.observations, function (observation) {
                return !_.isEmpty(observation.value);
            });
            encounterData.locationUuid = locationUuid;
            return encounterData;
        };
    }]);
