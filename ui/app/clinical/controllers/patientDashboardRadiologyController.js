angular.module('bahmni.clinical')
    .controller('PatientDashboardRadiologyController', ['$rootScope', '$scope', '$stateParams', 'encounterService', 'spinner', function ($rootScope, $scope, $stateParams, encounterService, spinner) {
        var encounterTypeUuid = $rootScope.encounterConfig.getRadiologyEncounterTypeUuid();

        spinner.forPromise(encounterService.getEncountersForEncounterType($stateParams.patientUuid, encounterTypeUuid).then(function (response) {
            var radiologyDocuments = new Bahmni.Clinical.PatientFileObservationsMapper().mapToDisplayItems(response.data.results);
            $scope.radiologyRecords = new Bahmni.Clinical.RadiologyRecordsMapper().mapToDisplayItems(radiologyDocuments);
        }));

        $scope.isRecordForCurrentVisit = function(record){
            return _.some(record.records,function(innerRecord){
                return innerRecord.visitUuid === $rootScope.activeVisit.uuid;
            });
        };
    }]);