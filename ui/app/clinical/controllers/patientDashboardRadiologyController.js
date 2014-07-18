angular.module('bahmni.clinical')
    .controller('PatientDashboardRadiologyController', ['$rootScope', '$scope', '$stateParams', 'encounterService', 'spinner', function ($rootScope, $scope, $stateParams, encounterService, spinner) {
        var encounterTypeUuid = $rootScope.encounterConfig.getRadiologyEncounterTypeUuid();

        spinner.forPromise(encounterService.getEncountersForEncounterType($stateParams.patientUuid, encounterTypeUuid).then(function (response) {
            $scope.radiologyRecords = new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            $scope.radiologyRecordGroups = new Bahmni.Clinical.RadiologyRecordsMapper().map($scope.radiologyRecords);
        }));

        $scope.isRecordForCurrentVisit = function(records){
            return _.some(records,function(record){ return record.visitUuid === $rootScope.activeVisit.uuid; });
        };
    }]);