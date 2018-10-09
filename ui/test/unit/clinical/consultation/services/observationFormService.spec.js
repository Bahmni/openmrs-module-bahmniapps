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

    var formTranslationResponse = {
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

    var formTranslationParams = {
        formName: 'some Name',
        formVersion: 'someVersion',
        locale: 'some Locale'
    };

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


    it('should call http service with default url to return the form translations', function () {
        var translationsUrl = '/openmrs/ws/rest/v1/bahmniie/form/translations';
        http.get.and.returnValue(formTranslationResponse);
        var httpPromise = this.formService.getFormTranslations(translationsUrl, formTranslationParams);

        expect(httpPromise).toEqual(formTranslationResponse);
        expect(http.get).toHaveBeenCalledWith(translationsUrl, { params: formTranslationParams });
    });

    it('should call http service with custom url to return the form translations', function () {
        var customUrl = '/openmrs/ws/rest/v1/customUrl';
        http.get.and.returnValue(formTranslationResponse);
        var httpPromise = this.formService.getFormTranslations(customUrl, formTranslationParams);

        expect(httpPromise).toEqual(formTranslationResponse);
        expect(http.get).toHaveBeenCalledWith(customUrl);
    });

});