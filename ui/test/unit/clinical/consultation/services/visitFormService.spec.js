'use strict';

describe('visitFormService', function () {

    var http, bahmniCookieStore;
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function ($provide) {
        http = jasmine.createSpyObj('http', ['get']);
        http.get.and.returnValue({"uuid": "12345"});
        bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        $provide.value('$http', http);
        $provide.value('$bahmniCookieStore', bahmniCookieStore);
    }));

    beforeEach(inject(['visitFormService', function (visitFormService) {
        this.visitFormService = visitFormService;
    }]));

    it('should call http service to return the form data', function () {
        var httpPromise = this.visitFormService.formData("patientUuid", 5);
        expect(httpPromise.uuid).toEqual("12345");
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/obs", {
            params: {
                s: "byPatientUuid",
                patient: "patientUuid",
                numberOfVisits: 5,
                v: "visitFormDetails",
                conceptNames:null,
                patientProgramUuid: undefined
            }
        });
    });

    it('should call http service to return the form data with concept names', function () {
        var httpPromise = this.visitFormService.formData("patientUuid", 5,["Vitals", "HIV"]);
        expect(httpPromise.uuid).toEqual("12345");
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/obs", {
            params: {
                s: "byPatientUuid",
                patient: "patientUuid",
                numberOfVisits: 5,
                conceptNames:["Vitals", "HIV"],
                v: "visitFormDetails",
                patientProgramUuid: undefined
            }
        });
    });

    it('should call http service to return the form data specific to program', function () {
        var httpPromise = this.visitFormService.formData("patientUuid", 5,["Vitals", "HIV"], "patientProgramUuid");
        expect(httpPromise.uuid).toEqual("12345");
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/obs", {
            params: {
                s: "byPatientUuid",
                patient: "patientUuid",
                numberOfVisits: 5,
                conceptNames:["Vitals", "HIV"],
                v: "visitFormDetails",
                patientProgramUuid: "patientProgramUuid"
            }
        });
    });
});