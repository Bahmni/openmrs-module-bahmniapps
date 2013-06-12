'use strict';

angular.module('opd.activePatientsListController', ['opd.patientsListService', 'opd.patientService'])
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', 'PatientsListService', 'PatientService', function ($route, $scope, $location, patientsListService, patientService) {
    (function () {
        var location = $route.current.params.location;
        patientsListService.getActivePatients(location).success(function (data) {
            data.activePatientsList.forEach(function (datum) {
                datum.image = patientService.constructImageUrl(datum.identifier);
            });
            $scope.activePatientsList = data.activePatientsList;
        });
    })();
}]);
