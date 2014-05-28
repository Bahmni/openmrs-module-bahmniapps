angular.module('bahmni.clinical')
    .controller('PatientDashboardRadiologyController', ['$rootScope', '$scope', '$stateParams', 'encounterService', 'spinner', function ($rootScope, $scope, $stateParams, encounterService, spinner) {
        var encounterTypeUuid = $rootScope.encounterConfig.getRadiologyEncounterTypeUuid();
        spinner.forPromise(encounterService.getEncountersForEncounterType($stateParams.patientUuid, encounterTypeUuid).success(function (data) {
            var radiologyDocuments = new Bahmni.Clinical.PatientFileObservationsMapper().mapToDisplayItems(data.results);
            $scope.radiologyRecords = new Bahmni.Clinical.RadiologyRecordsMapper().mapToDisplayItems(radiologyDocuments);
        }));

    }]);