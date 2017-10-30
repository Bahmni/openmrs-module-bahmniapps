'use strict';

describe('formService', function () {

    var http;
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function ($provide) {
        http = jasmine.createSpyObj('http', ['get']);
        $provide.value('$http', http);
    }));

    beforeEach(inject(['formService', function (formService) {
        this.formService = formService;
    }]));

    it('should call http service to return the form list', function () {
        var response = { data: { results: [{ name: 'form1' }] } };
        http.get.and.returnValue(response);

        var httpPromise = this.formService.getFormList("encounterUuid");

        expect(httpPromise).toEqual(response);
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/bahmniie/form/latestPublishedForms", {
            params: { encounterUuid: "encounterUuid" }
        });
    });

    it('should call http service to return all the forms with name, version and uuid', function () {
        var response = { data: { resources: [{ value: 'form1' }] } };
        http.get.and.returnValue(response);

        var httpPromise = this.formService.getAllForms();

        expect(httpPromise).toEqual(response);
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/bahmniie/form/allForms", { params : { v : 'custom:(version,name,uuid)' } });

    });

    it('should call http service to return the form detail', function () {
        var response = { data: { resources: [{ value: 'form1' }] } };
        http.get.and.returnValue(response);

        var httpPromise = this.formService.getFormDetail('someFormUuid', { v: "custom:(uuid,name)" });

        expect(httpPromise).toEqual(response);
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/form/someFormUuid", {
            params: { v: "custom:(uuid,name)" }
        });
    });

    it('should call http service to return the form translations', function () {
        var response = {
            data: [
                {
                    en: {
                        labels: {
                            LABEL_1: 'Vital'
                        },
                        concepts: {
                            TEMPERATURE_2: 'Temperature'
                        }
                    }
                }
            ]
        };
        http.get.and.returnValue(response);

        var form = {
            formName: 'some Name',
            formVersion: 'someVersion',
            locale: 'some Locale'
        };

        var httpPromise = this.formService.getFormTranslations(form);

        expect(httpPromise).toEqual(response);
        expect(http.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/bahmniie/form/translations", {
            params: form
        });
    });

});