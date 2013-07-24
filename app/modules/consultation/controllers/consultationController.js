'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', function ($scope) {
      $scope.patient = Bahmni.Opd.currentPatient;
}]);
