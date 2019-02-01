'use strict';

describe('FormService', function () {
    var formService;
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['formService', function (formServiceInjected) {
            formService = formServiceInjected;
        }]);
    });

    it('should retrieve all V2 forms for a patient', function () {
        const patientUuid = 'patientUuid';
        const numberOfVisits = 10;
        const patientProgramUuid = 'programUuid';
        const data = {formName: 'Test'};
        const params = {
            numberOfVisits: numberOfVisits,
            formType: 'v2',
            patientProgramUuid: patientProgramUuid
        };
        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        formService.getAllPatientForms(patientUuid, numberOfVisits,
            patientProgramUuid).then(function (response){
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/bahmnicore/patient/patientUuid/forms");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
    });
});
