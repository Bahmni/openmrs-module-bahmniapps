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

    }]);

