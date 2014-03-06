'use strict';

angular.module('opd.consultation')
    .controller('ConsultationController', ['$scope', '$rootScope', 'encounterService', '$route', '$location', 'spinner', function ($scope, $rootScope, encounterService, $route, $location, spinner) {

    $scope.save = function () {
        
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid();
        encounterData.encounterDateTime = $rootScope.consultation.encounterDateTime || new Date();

        if ($rootScope.consultation.diagnoses && $rootScope.consultation.diagnoses.length > 0){
            encounterData.diagnoses = $rootScope.consultation.diagnoses.map(function (diagnosis) {
                return {
                    codedAnswer: { uuid: diagnosis.codedAnswer.uuid },
                    order: diagnosis.order,
                    certainty: diagnosis.certainty,
                    existingObs: diagnosis.existingObs,
                    diagnosisDateTime: diagnosis.diagnosisDateTime
                }
            });
        }

        encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
            return { uuid:investigation.uuid, concept: {uuid: investigation.concept.uuid }, orderTypeUuid:investigation.orderTypeUuid, voided: investigation.voided || false};
        });

        var startDate = new Date();
        var allTreatmentDrugs = $rootScope.consultation.treatmentDrugs || [];
        var newlyAddedTreatmentDrugs = allTreatmentDrugs.filter(function (drug) {
            return !drug.savedDrug;
        });

        if (newlyAddedTreatmentDrugs) {
            encounterData.drugOrders = newlyAddedTreatmentDrugs.map(function (drug) {
                return drug.requestFormat(startDate);
            });
        }

        encounterData.disposition = $rootScope.disposition;

        var addObservationsToEncounter = function(){
            encounterData.observations = encounterData.observations || [];
            if ($scope.consultation.consultationNote.value) {
                encounterData.observations.push($scope.consultation.consultationNote);
            }
            if ($scope.consultation.labOrderNote.value) {
                encounterData.observations.push($scope.consultation.labOrderNote);
            }
            encounterData.observations = encounterData.observations.concat($rootScope.consultation.observations);
        };

        addObservationsToEncounter();

        spinner.forPromise(encounterService.create(encounterData).success(function () {
            window.location = Bahmni.Opd.Consultation.Constants.activePatientsListUrl;
        }));
    };

    $scope.onNoteChanged = function() {
        $scope.consultation.consultationNote.observationDateTime = new Date();
    }        
}]);

