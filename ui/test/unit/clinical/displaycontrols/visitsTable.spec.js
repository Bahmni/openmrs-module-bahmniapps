'use strict';

describe("Visits Table display control", function () {
    var element, scope, $compile, mockBackend, conceptSetService, visitFormService, patientVisitHistoryService, $translate, appService;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function($provide) {
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
        visitFormService = jasmine.createSpyObj('visitFormService', ['formData']);
        $translate = jasmine.createSpyObj('$translate', ['instant']);
        patientVisitHistoryService= jasmine.createSpyObj('patientVisitHistoryService', ['getVisitHistory']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (config) {
                if (config == 'enableIPDFeature') {
                    return true;
                }
            }
        });
        $provide.value('$state', {});
        $provide.value('$bahmniCookieStore', {});
        $provide.value('clinicalAppConfigService', {getObsIgnoreList: function(){return []}});
        $provide.value('$bahmniTranslate', {use: function() {return "en"}});
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('visitFormService', visitFormService);
        $provide.value('patientVisitHistoryService', patientVisitHistoryService);
        $provide.value('$translate', $translate);
        $provide.value('appService', appService);
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        scope.patientUuid = '123';
        scope.params = {};
        mockBackend = $httpBackend;
        mockBackend.expectGET("displaycontrols/allvisits/views/visitsTable.html").respond("<div></div>");
    }));

    var mockConceptSetService = function (data) {
        conceptSetService.getConcept.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    var mockVisitFormService = function (data) {
        visitFormService.formData.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    var mockPatientVisitHistoryService = function (data) {
        patientVisitHistoryService.getVisitHistory.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };


    it("should show visit tables", function () {
        element = angular.element('<visits-table></visits-table>');
        $compile(element)(scope);
        scope.$digest();

        expect(element.scope().patientUuid).toBe("123");
    });


    var allObsTemplateData = {"data": {"results": [{"display":"Baseline Template"},{"display":"Medication log Template"},{"display":"Followup Template"},{"display":"Outcome End of Treatment Template"}]}};
    var formDataObj = {"data": {results: [
        {
            "uuid": "2625f662-a807-4682-844a-ccff002e669d",
            "concept": {
                "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                "display": "Medication log Template"
            },
            "display": "Medication log Template: 2015-11-01, Not defined",
            "obsDatetime": "2015-12-18T16:26:31.000+0000"
        },
        {
            "uuid": "ace25383-0baf-4c52-96bd-224d8caca00e",
            "concept": {
                "uuid": "bb80d45d-e4c5-4ce0-bb7c-0a34d2635ea5",
                "display": "Outcome End of Treatment Template"
            },
            "display": "Outcome End of Treatment Template: 2015-11-17",
            "obsDatetime": "2015-11-18T16:26:30.000+0000"
        }
    ]}};

});
