'use strict';

describe("bahmniTranslate", function(){
    var filter,translate;

    beforeEach(module('bahmni.common.i18n', function($provide){
        translate = jasmine.createSpyObj('$translate', [ 'storageKey','instant','storage','preferredLanguage']);
        $provide.value('$translate',translate);
    }));

    beforeEach(inject(function(titleTranslateFilter){
        filter = titleTranslateFilter;
    }));

    it("send input as null and to be null", function(){
        expect(filter(undefined)).toBe(undefined);
    });

    it("ensure that the translationKey is used for translations", function () {
        var input = {'translationKey': 'TEST_KEY'};
        filter(input);
        expect(translate.instant).toHaveBeenCalledWith("TEST_KEY");
    });

    it("send dashboard name as part of the object and ensure that it returns", function () {
        var input = {'dashboardName': 'general'};
        expect(filter(input)).toEqual("general");
    });

    it("send title as part of the object and ensure that it returns", function () {
        var input = {'title': 'consultaion'};
        expect(filter(input)).toEqual("consultaion");
    });

    it("send label as part of the object and ensure that it returns", function () {
        var input = {'label': 'patient'};
        expect(filter(input)).toEqual("patient");
    });

    it("send display as part of the object and ensure that it returns", function () {
        var input = {'display': 'home'};
        expect(filter(input)).toEqual("home");
    });

    it("send a string and ensure that it returns", function () {
        var input = "testString";
        filter(input);
        expect(translate.instant).toHaveBeenCalledWith("testString");
    });

    it("send dashboard,title, and display as part of the object and ensure that dashboard returns", function () {
        var input = {'title': 'consultaion',
                     'dashboardName': 'general',
                     'display': 'home'
                         };
        expect(filter(input)).toEqual("general");
    });


});