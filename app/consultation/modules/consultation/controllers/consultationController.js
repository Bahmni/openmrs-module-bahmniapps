'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {


    var getCertaintyValue = function (isConfirmed) {
        if (isConfirmed === true) {
            return "CONFIRMED";
        }
        else {
            return "PRESUMED";
        }
    }
    var getOrderValue = function (isPrimary) {
        if (isPrimary === true) {
            return "PRIMARY";
        }
        else {
            return "SECONDARY";
        }
    }
    var getDiagnoses = function () {
        return $rootScope.consultation.diagnoses.map(function (diagnosis) {
            return {
                diagnosis:'codedAnswer:' + diagnosis.concept.conceptUuid,
                certainty:getCertaintyValue(diagnosis.isConfirmed),
                order:getOrderValue(diagnosis.isPrimary)
            };
        });
    };

    $scope.save = function () {
        var encounterData = {};
        encounterData.patientUUID = $scope.patient.uuid;
        encounterData.encounterTypeUUID = $rootScope.encounterConfig.getOpdConsultationEncounterUUID();
        encounterData.diagnoses = getDiagnoses();
        encounterData.testOrders = $rootScope.consultation.investigations.map(function (test) {
            return { conceptUUID:test.uuid }
        });
        consultationService.create(encounterData).success(function () {
            window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
    };
}]);
