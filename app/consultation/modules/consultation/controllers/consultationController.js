'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'encounterService', '$route', '$location', function ($scope, $rootScope, encounterService, $route, $location) {

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
                uuid  : lastNote.uuid
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
                    codedAnswer: { uuid: diagnosis.concept.conceptUuid },
                    order:diagnosis.order,
                    certainty:diagnosis.certainty,
                    existingObs:diagnosis.existingObsUuid
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

        encounterData.disposition = $rootScope.disposition.adtToStore;

        var addObservationsToEncounter = function(){
            if ($scope.consultationNote.value) {
                encounterData.observations = encounterData.observations || [];
                encounterData.observations.push($scope.consultationNote);
            }

            encounterData.observations = [];
            for (var i in $rootScope.observationList) {
                if ($rootScope.observationList[i]) {
                    encounterData.observations = encounterData.observations.concat($rootScope.observationList[i]);
                }
            }
        };

        addObservationsToEncounter();

        encounterService.create(encounterData).success(function () {
            window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
    };
}]).directive('showObs', ['$rootScope', function () {
    return {
        restrict:'E',
        scope:{
            observation:"="
        },
        template:'<ng-include src="\'modules/consultation/views/showObservation.html\'" />'
    }
}]);
