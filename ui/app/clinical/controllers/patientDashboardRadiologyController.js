angular.module('bahmni.clinical')
    .controller('PatientDashboardRadiologyController', ['$rootScope', '$scope', '$stateParams', 'encounterService', function ($rootScope, $scope, $stateParams, encounterService) {
        var encounterTypeUuid = $rootScope.encounterConfig.getRadiologyEncounterTypeUuid();
        encounterService.getEncountersForEncounterType($stateParams.patientUuid, encounterTypeUuid).success(function (data) {
            var radiologyDocuments = new Bahmni.Clinical.PatientFileObservationsMapper().mapToDisplayItems(data.results);
            $scope.displayRadiologyRecords = new Bahmni.Clinical.RadiologyRecordsMapper().mapToDisplayItems(radiologyDocuments);
        });

    }]);