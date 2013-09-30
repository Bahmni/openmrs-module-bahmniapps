'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {

    $scope.save = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterUuid();
//        encounterData.diagnoses = $rootScope.consultation.diagnoses.map(function(diagnosis) {
//            return {
//                diagnosis: "Concept:" + diagnosis.concept.conceptId,
//                order: diagnosis.order,
//                certainty: diagnosis.certainty
//            }
//        });
        encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
            return { conceptUuid: investigation.uuid, orderTypeUuid: investigation.orderTypeUuid };
        });


        var treatmentDrugs = $rootScope.consultation.treatmentDrugs || [];
        encounterData.drugOrders = treatmentDrugs.map(function (drug) {
            var startDate = new Date();
            var endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + drug.numberOfDosageDays);

            return {
                uuid: drug.uuid,
                conceptUuid: drug.conceptUuid,
                notes:drug.notes,
                startDate:startDate,
                endDate:endDate,
                numberPerDosage: drug.numberPerDosage,
                dosageInstructionUuid:drug.dosageInstruction? drug.dosageInstruction.uuid : '',
                dosageFrequencyUuid:drug.dosageFrequency? drug.dosageFrequency.uuid : '',
                prn:drug.prn
            };
        });

      //  encounterData.disposition = $rootScope.disposition.adtToStore;

        consultationService.create(encounterData).success(function(){
            window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
      };
}]);
