'use strict';

describe('PatientDashboardObservationSectionController', function () {
   var $rootScope,
       $scope,
       controller;
   beforeEach(function () {
       module('bahmni.clinical');

       inject(function ($rootScope,$controller) {
           $scope = $rootScope.$new();
           $scope.ngDialogData = { patient: {patientUuid: 1234},
                                   section: {title:"Vitals"}
           };
           controller = $controller('PatientDashboardObservationSectionController', {$scope: $scope});

       });
   });

   it('should set the patient and section on the scope', function () {
      expect($scope.patient).toEqual({patientUuid: 1234});
      expect($scope.section).toEqual({title:"Vitals"});

   });
});
