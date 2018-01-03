'use strict';

angular.module('bahmni.clinical')
    .controller('ConsultationSummaryController', ['$scope', 'conceptSetUiConfigService', function ($scope, conceptSetUiConfigService) {
        var geEditedDiagnosesFromPastEncounters = function () {
            var editedDiagnosesFromPastEncounters = [];
            $scope.consultation.pastDiagnoses.forEach(function (pastDiagnosis) {
                if (pastDiagnosis.isDirty && pastDiagnosis.encounterUuid !== $scope.consultation.encounterUuid) {
                    editedDiagnosesFromPastEncounters.push(pastDiagnosis);
                }
            });
            return editedDiagnosesFromPastEncounters;
        };
        $scope.editedDiagnosesFromPastEncounters = geEditedDiagnosesFromPastEncounters();

        $scope.onNoteChanged = function () {
//        TODO: Mihir, D3 : Hacky fix to update the datetime to current datetime on the server side. Ideal would be void the previous observation and create a new one.
            $scope.consultation.consultationNote.observationDateTime = null;
        };

        var groupObservations = function () {
            var allObservations = $scope.consultation.observations;
            allObservations = _.filter(allObservations, function (obs) {
                if (obs.concept.name === 'Dispensed') {
                    return false;
                }
                if ($scope.followUpConditionConcept && obs.concept.uuid === $scope.followUpConditionConcept.uuid) {
                    return false;
                }
                return true;
            });
            return new Bahmni.Clinical.ObsGroupingHelper(conceptSetUiConfigService).groupObservations(allObservations);
        };

        $scope.groupedObservations = groupObservations();
        $scope.disposition = $scope.consultation.disposition;
        $scope.toggle = function (item) {
            item.show = !item.show;
        };

        $scope.isConsultationTabEmpty = function () {
            if (_.isEmpty($scope.consultation.newlyAddedDiagnoses) && _.isEmpty($scope.groupedObservations) &&
                _.isEmpty($scope.consultation.newlyAddedSpecimens) && _.isEmpty($scope.consultation.consultationNote.value) &&
                _.isEmpty($scope.consultation.investigations) && _.isEmpty($scope.consultation.disposition) &&
                _.isEmpty($scope.consultation.treatmentDrugs) && _.isEmpty($scope.consultation.newlyAddedTreatments) &&
                _.isEmpty($scope.consultation.discontinuedDrugs) && _.isEmpty($scope.consultation.savedDiagnosesFromCurrentEncounter)) {
                return true;
            }
            return false;
        };
    }]);

