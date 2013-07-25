'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {
      $scope.patient = $rootScope.currentPatient;
	  $scope.patient.uuid = $route.current.params.patientUuid; //TODO: Remove this once load patient story is played

      $scope.save = function() {
        var encocounterData = {};
        encocounterData.patientUUID = $scope.patient.uuid;
        encocounterData.encounterTypeUUID = $rootScope.encounterConfig.getOpdConsultationEncounterUUID();
        encocounterData.testOrders = $rootScope.currentConsultation.tests.map(function(test) {
        	return { conceptUUID: test.uuid }
        });
        consultationService.create(encocounterData).success(function(){
        	$rootScope.currentConsultation = {};
        	$location.url(Bahmni.Opd.Constants.activePatientsListUrl);
        });
      };      
}]);
