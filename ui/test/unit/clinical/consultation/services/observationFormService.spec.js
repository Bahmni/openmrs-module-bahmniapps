'use strict';

describe('observationFormService', function () {

    var http;
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function ($provide) {
        http = jasmine.createSpyObj('http', ['get']);
        $provide.value('$http', http);
    }));

    beforeEach(inject(['observationFormService', function (observationFormService) {
        this.observationFormService = observationFormService;
    }]));

    it('should call http service to return the form list', function () {
        var response = { data: { results: [{ name: 'form1' }] } };
        http.get.and.returnValue(response);

        var httpPromise = this.observationFormService.getFormList("encounterUuid");

        expect(httpPromise).toEqual(response);
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/bahmniie/form/latestPublishedForms", {
            params: { encounterUuid: "encounterUuid" }
        });
    });

    it('should call http service to return the form detail', function () {
        var response = { data: { resources: [{ value: 'form1' }] } };
        http.get.and.returnValue(response);

        var httpPromise = this.observationFormService.getFormDetail('someFormUuid', { v: "custom:(uuid,name)" });

        expect(httpPromise).toEqual(response);
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/form/someFormUuid", {
            params: { v: "custom:(uuid,name)" }
        });
    });
});