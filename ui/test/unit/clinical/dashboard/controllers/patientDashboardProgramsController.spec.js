/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


describe("PatientDashboardProgramsController", function () {
    var scope, state;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.section={templateName:""};
        state = jasmine.createSpyObj('$state',['go']);
        $controller('PatientDashboardProgramsController', {
            $scope: scope,
            $state:state,
            $stateParams:null
        });
    }));

    describe("gotoDetailsPage", function () {
        it("should transition to patient.patientProgram.show state", function(){
            scope.gotoDetailsPage()
            expect(state.go).toHaveBeenCalledWith('patient.patientProgram.show');
        });
    });

});