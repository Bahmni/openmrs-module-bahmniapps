/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('AllObservationDetailsController', function () {
   var $rootScope,
       $scope,
       controller;
   beforeEach(function () {
       module('bahmni.common.displaycontrol.observation');

       inject(function ($rootScope,$controller) {
           $scope = $rootScope.$new();
           $scope.ngDialogData = { patient: {patientUuid: 1234},
                                   section: {title:"Vitals"}
           };
           controller = $controller('AllObservationDetailsController', {$scope: $scope});

       });
   });

   it('should set the patient and section on the scope', function () {
      expect($scope.patient).toEqual({patientUuid: 1234});
      expect($scope.section).toEqual({title:"Vitals"});

   });
});
