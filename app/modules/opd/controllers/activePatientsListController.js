'use strict';

angular.module('opd.activePatientsListController', ['opd.patientsListService', 'opd.patientService'])
    .controller('ActivePatientsListController', ['$scope', '$location', 'PatientsListService', 'PatientService', function ($scope, $location, patientsListService, patientService) {
    (function () {
        patientsListService.getActivePatients("Ganiyari").success(function (data) {
            data.activePatientsList.forEach(function (datum) {
                datum.image = patientService.constructImageUrl(datum.identifier);
            });
            $scope.activePatientsList = data.activePatientsList;
        });
    })();
}]);
