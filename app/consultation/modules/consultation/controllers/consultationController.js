'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {

//    var getDiagnoses = function () {
//        return $rootScope.consultation.diagnoses.map(function (diagnosis) {
//            return {
//                diagnosis:'codedAnswer:' + diagnosis.concept.conceptUuid,
//                certainty:getCertaintyValue(diagnosis.isConfirmed),
//                order:getOrderValue(diagnosis.isPrimary)
//            };
//        });
//    };

    $scope.save = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterUUID();
//        encounterData.diagnoses = getDiagnoses();
        encounterData.testOrders = $rootScope.consultation.investigations.map(function (test) {
            return { conceptUUID:test.uuid }
        });
        consultationService.create(encounterData).success(function () {
            window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
    };
}]);
