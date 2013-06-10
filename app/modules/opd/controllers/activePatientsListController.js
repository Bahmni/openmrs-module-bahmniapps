'use strict';

angular.module('opd.activePatientsListController', ['opd.patientsListService', 'infrastructure.configurationService'])
    .controller('ActivePatientsListController', ['$scope', '$location', 'PatientsListService', 'ConfigurationService', function ($scope, $location, patientsListService, configurationService) {

    (function () {
        patientsListService.getActivePatients("Ganiyari").success(function (data) {
            data.activePatientsList.forEach(function(datum){
                datum.image = configurationService.getImageUrl() + "/" + datum.identifier + ".jpeg";
            });
            $scope.activePatientsList = data.activePatientsList;
        });
    })();
}]);
