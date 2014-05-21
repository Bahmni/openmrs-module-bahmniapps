'use strict';

angular.module('bahmni.clinical')
    .controller('ConsultationController', ['$scope', '$rootScope', 'encounterService', '$location', 'spinner', function ($scope, $rootScope) {
        var geEditedDiagnosesFromPastEncounters = function () {
            var editedDiagnosesFromPastEncounters = [];
            $rootScope.consultation.pastDiagnoses.forEach(function (pastDiagnosis) {
                if (pastDiagnosis.isDirty && pastDiagnosis.encounterUuid !== $rootScope.consultation.encounterUuid) {
                    editedDiagnosesFromPastEncounters.push(pastDiagnosis);
                }
            });
            return editedDiagnosesFromPastEncounters;
        };
        $scope.editedDiagnosesFromPastEncounters = geEditedDiagnosesFromPastEncounters();

        $scope.onNoteChanged = function () {
            $scope.consultation.consultationNote.observationDateTime = new Date();
        };

        var groupedObservations = function(){
            var groupedObservationsArray = [];
            $scope.consultation.observations.forEach(function(observation){
                var temp =[];
                temp[0]=observation;
                var observationsByGroup={
                    "conceptSetName": observation.concept.name,
                    "groupMembers": new Bahmni.ConceptSet.ObservationMapper().getObservationsForView(temp)
                };
                if(observationsByGroup.groupMembers.length){
                    groupedObservationsArray.push(observationsByGroup);
                }
            });
            return groupedObservationsArray;
        };
        $scope.groupedObservations = groupedObservations();
    }]);

