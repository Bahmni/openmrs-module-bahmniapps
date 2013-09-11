'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'consultationService', '$route', '$location', function ($scope, $rootScope, consultationService, $route, $location) {

      $scope.save = function() {
        var encocounterData = {};
        encocounterData.patientUUID = $scope.patient.uuid;
        encocounterData.encounterTypeUUID = $rootScope.encounterConfig.getOpdConsultationEncounterUUID();
        encocounterData.testOrders = $rootScope.currentConsultation.tests.map(function(test) {
        	return { conceptUUID: test.uuid }
        });
        consultationService.create(encocounterData).success(function(){
        	window.location = Bahmni.Opd.Constants.activePatientsListUrl;
        });
      };      
}]);
