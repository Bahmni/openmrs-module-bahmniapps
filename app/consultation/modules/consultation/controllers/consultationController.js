'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {

    $scope.save = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterUuid();

        // this is breaking the save functionality
//        encounterData.diagnoses = $rootScope.consultation.diagnoses.map(function(diagnosis) {
//            return {
//                diagnosis: "Concept:" + diagnosis.concept.conceptUuid,
//                order: diagnosis.order,
//                certainty: diagnosis.certainty
//            }
//        });

        encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
            return { uuid: investigation.uuid, conceptUuid: investigation.conceptUuid, orderTypeUuid: investigation.orderTypeUuid };
        });


        var startDate = new Date();


        var allTreatmentDrugs = $rootScope.consultation.treatmentDrugs || [];
        var newlyAddedTreatmentDrugs = allTreatmentDrugs.filter(function(drug){
            return !drug.savedDrug;
        });

        if (newlyAddedTreatmentDrugs){
        encounterData.drugOrders = newlyAddedTreatmentDrugs.map(function (drug) {
            return drug.requestFormat(startDate);
        });
        }

      //  encounterData.disposition = $rootScope.disposition.adtToStore;

        consultationService.create(encounterData).success(function(){
            window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
      };
}]);
