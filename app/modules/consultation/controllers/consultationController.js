'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', function ($scope, $rootScope, consultationService, $route) {
      $scope.patient = $rootScope.currentPatient;
	  $scope.patient.uuid = $route.current.params.patientUuid; //TODO: Remove this once load patient story is played

      $scope.save = function() {
        var encocounterData = {};
        encocounterData.patientUUID = $scope.patient.uuid; //Theres work
        encocounterData.encounterTypeUUID = $rootScope.encounterConfig.getOpdConsultationEncounterUUID();
        encocounterData.testOrders = $rootScope.currentConsultation.tests.map(function(test) {
        	return { conceptUUID: test.uuid }
        });
        consultationService.create(encocounterData);
      };      
}]);
