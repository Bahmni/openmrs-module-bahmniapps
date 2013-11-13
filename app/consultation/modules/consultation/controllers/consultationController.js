'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {

    $scope.consultationNote = {conceptUuid : null, value: null};

    var initialize = function() {
        if ($rootScope.consultationNote) {
            $scope.consultationNote = $rootScope.consultationNote;
        } else if ($rootScope.consultation.consultationNotes.length > 0) {
            //NOTE: This will need to change when we do the encounter session based data view
            //This should take in consideration data across all encounters for a visit.
            //TODO: should take the first visit with date_created sorted desc
            var lastNote = $rootScope.consultation.consultationNotes[0];
            $scope.consultationNote = {
                conceptUuid : lastNote.concept.uuid,
                value : lastNote.value,
                observationUuid  : lastNote.uuid
            };
        } else if ($rootScope.consultationNoteConfig) {
            $scope.consultationNote.conceptUuid = ($rootScope.consultationNoteConfig.results.length > 0) ? $rootScope.consultationNoteConfig.results[0].uuid : null;
        }
    };

    $scope.$on('$destroy', function() {
        $rootScope.consultationNote = $scope.consultationNote;
    });

    initialize();

    $scope.save = function () {
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterUuid();

        if ($rootScope.consultation.diagnoses && $rootScope.consultation.diagnoses.length > 0){
            encounterData.diagnoses = $rootScope.consultation.diagnoses.map(function (diagnosis) {
                return {
                    diagnosis:"ConceptUuid:" + diagnosis.concept.conceptUuid,
                    order:diagnosis.order,
                    certainty:diagnosis.certainty,
                    existingObs:diagnosis.existingObsUuid
                }
            });
        }


        encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
            return { uuid:investigation.uuid, conceptUuid:investigation.conceptUuid, orderTypeUuid:investigation.orderTypeUuid };
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

        encounterData.disposition = $rootScope.disposition.adtToStore;

        var addObservationsToEncounter = function() {
            if ($scope.consultationNote.value) {
                encounterData.observations = encounterData.observations || [];
                encounterData.observations.push($scope.consultationNote);
            }
//            if($rootScope.vitals && $rootScope.vitals.recordedVitals) {
//                encounterData.observations = [];
//                encounterData.observations = encounterData.observations.concat($rootScope.vitals.recordedVitals);
//            }
        };

        addObservationsToEncounter();

        consultationService.create(encounterData).success(function () {
            window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
    };
}]);
